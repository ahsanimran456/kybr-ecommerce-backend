const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

/**
 * Store Orders - customer ke apne orders
 * Now supports product variants (size + color)
 */

const listOrders = async (userId, query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.status) q = q.eq("status", query.status);

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getOrder = async (userId, orderId) => {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !order) throw new HttpError("Order not found", 404, "NotFound");

  // Get order items with variant info
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(id, name, slug, image_url)")
    .eq("order_id", orderId);

  return { ...order, items: items || [] };
};

const createOrder = async (userId, body) => {
  const { shipping_address, payment_method, notes } = body;

  if (!shipping_address) {
    throw new HttpError("Shipping address is required", 400, "BadRequest");
  }

  // Get user's cart items with variants
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("*, products(id, name, price, stock, is_active), product_variants(id, size, color, stock, price)")
    .eq("user_id", userId);

  if (cartError) throw new HttpError(cartError.message, 400, "BadRequest");

  if (!cartItems || cartItems.length === 0) {
    throw new HttpError("Cart is empty", 400, "BadRequest");
  }

  // Validate all products + variants are available
  for (const item of cartItems) {
    if (!item.products || !item.products.is_active) {
      throw new HttpError(`Product "${item.products?.name || 'Unknown'}" is no longer available`, 400, "BadRequest");
    }

    if (item.variant_id && item.product_variants) {
      // Variant stock check
      if (item.product_variants.stock < item.quantity) {
        throw new HttpError(
          `Not enough stock for "${item.products.name}" (${item.product_variants.size}, ${item.product_variants.color})`,
          400,
          "BadRequest"
        );
      }
    } else {
      // Product stock check
      if (item.products.stock < item.quantity) {
        throw new HttpError(`Not enough stock for "${item.products.name}"`, 400, "BadRequest");
      }
    }
  }

  // Calculate totals - variant price ya product price
  const subtotal = cartItems.reduce((sum, item) => {
    const variantPrice = item.product_variants?.price;
    const productPrice = item.products.price;
    const price = parseFloat(variantPrice || productPrice);
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      subtotal,
      shipping_fee: shippingFee,
      total,
      shipping_address,
      payment_method: payment_method || "",
      notes: notes || "",
    })
    .select()
    .single();

  if (orderError) throw new HttpError(orderError.message, 400, "BadRequest");

  // Create order items with variant info
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    product_name: item.products.name,
    variant_size: item.product_variants?.size || "",
    variant_color: item.product_variants?.color || "",
    quantity: item.quantity,
    price: parseFloat(item.product_variants?.price || item.products.price),
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw new HttpError(itemsError.message, 400, "BadRequest");

  // Reduce stock - variant or product
  for (const item of cartItems) {
    if (item.variant_id && item.product_variants) {
      // Reduce variant stock
      await supabase
        .from("product_variants")
        .update({ stock: item.product_variants.stock - item.quantity })
        .eq("id", item.variant_id);
    } else {
      // Reduce product stock
      await supabase
        .from("products")
        .update({ stock: item.products.stock - item.quantity })
        .eq("id", item.product_id);
    }
  }

  // Clear cart
  await supabase.from("cart_items").delete().eq("user_id", userId);

  return { ...order, items: orderItems };
};

module.exports = {
  storeOrdersService: { listOrders, getOrder, createOrder },
};
