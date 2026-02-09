const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");

/**
 * Cart Service - authenticated users only
 * Now supports product variants (size + color)
 */

const getCart = async (userId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(id, name, slug, price, image_url), product_variants(id, size, color, stock, price)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  // Calculate totals - variant price ya product price
  const items = data || [];
  const total = items.reduce((sum, item) => {
    const variantPrice = item.product_variants?.price;
    const productPrice = item.products?.price;
    const price = parseFloat(variantPrice || productPrice || 0);
    return sum + price * item.quantity;
  }, 0);

  return {
    items,
    total_items: items.length,
    total,
  };
};

const addItem = async (userId, body) => {
  const { product_id, variant_id, quantity } = body;

  if (!product_id) {
    throw new HttpError("Product ID is required", 400, "BadRequest");
  }

  // Check product exists and is active
  const { data: product } = await supabase
    .from("products")
    .select("id, stock, is_active")
    .eq("id", product_id)
    .eq("is_active", true)
    .single();

  if (!product) throw new HttpError("Product not found", 404, "NotFound");

  const qty = Math.max(1, parseInt(quantity) || 1);

  // If variant_id provided, check variant stock
  let variant = null;
  if (variant_id) {
    const { data: v } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", variant_id)
      .eq("product_id", product_id)
      .eq("is_active", true)
      .single();

    if (!v) throw new HttpError("Variant not found", 404, "NotFound");

    if (v.stock < qty) {
      throw new HttpError(`Not enough stock for size ${v.size}, color ${v.color}`, 400, "BadRequest");
    }
    variant = v;
  } else {
    // No variant - check product stock
    if (product.stock < qty) {
      throw new HttpError("Not enough stock available", 400, "BadRequest");
    }
  }

  // Check if same product + variant already in cart
  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", product_id);

  if (variant_id) {
    existingQuery = existingQuery.eq("variant_id", variant_id);
  } else {
    existingQuery = existingQuery.is("variant_id", null);
  }

  const { data: existing } = await existingQuery.single();

  let result;
  const stockLimit = variant ? variant.stock : product.stock;

  if (existing) {
    const newQty = existing.quantity + qty;
    if (stockLimit < newQty) {
      throw new HttpError("Not enough stock available", 400, "BadRequest");
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", existing.id)
      .select("*, products(id, name, slug, price, image_url), product_variants(id, size, color, stock, price)")
      .single();

    if (error) throw new HttpError(error.message, 400, "BadRequest");
    result = data;
  } else {
    const insertData = { user_id: userId, product_id, quantity: qty };
    if (variant_id) insertData.variant_id = variant_id;

    const { data, error } = await supabase
      .from("cart_items")
      .insert(insertData)
      .select("*, products(id, name, slug, price, image_url), product_variants(id, size, color, stock, price)")
      .single();

    if (error) throw new HttpError(error.message, 400, "BadRequest");
    result = data;
  }

  return result;
};

const updateItem = async (userId, itemId, body) => {
  const { quantity } = body;
  const qty = Math.max(1, parseInt(quantity) || 1);

  const { data: item } = await supabase
    .from("cart_items")
    .select("*, products(id, stock), product_variants(id, stock)")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new HttpError("Cart item not found", 404, "NotFound");

  // Check stock - variant or product
  const stockLimit = item.product_variants ? item.product_variants.stock : item.products.stock;
  if (stockLimit < qty) {
    throw new HttpError("Not enough stock available", 400, "BadRequest");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .eq("id", itemId)
    .select("*, products(id, name, slug, price, image_url), product_variants(id, size, color, stock, price)")
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const removeItem = async (userId, itemId) => {
  const { data: item } = await supabase
    .from("cart_items")
    .select("id")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new HttpError("Cart item not found", 404, "NotFound");

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Item removed from cart" };
};

const clearCart = async (userId) => {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Cart cleared" };
};

module.exports = {
  storeCartService: { getCart, addItem, updateItem, removeItem, clearCart },
};
