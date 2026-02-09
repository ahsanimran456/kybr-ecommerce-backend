const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");

/**
 * Cart Service - authenticated users only
 */

const getCart = async (userId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(id, name, slug, price, image_url, stock)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  // Calculate totals
  const items = data || [];
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.products?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  return {
    items,
    total_items: items.length,
    total,
  };
};

const addItem = async (userId, body) => {
  const { product_id, quantity } = body;

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

  if (product.stock < qty) {
    throw new HttpError("Not enough stock available", 400, "BadRequest");
  }

  // Upsert - if item already in cart, update quantity
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", product_id)
    .single();

  let result;

  if (existing) {
    const newQty = existing.quantity + qty;
    if (product.stock < newQty) {
      throw new HttpError("Not enough stock available", 400, "BadRequest");
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", existing.id)
      .select("*, products(id, name, slug, price, image_url)")
      .single();

    if (error) throw new HttpError(error.message, 400, "BadRequest");
    result = data;
  } else {
    const { data, error } = await supabase
      .from("cart_items")
      .insert({ user_id: userId, product_id, quantity: qty })
      .select("*, products(id, name, slug, price, image_url)")
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
    .select("*, products(id, stock)")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new HttpError("Cart item not found", 404, "NotFound");

  if (item.products.stock < qty) {
    throw new HttpError("Not enough stock available", 400, "BadRequest");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .eq("id", itemId)
    .select("*, products(id, name, slug, price, image_url)")
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
