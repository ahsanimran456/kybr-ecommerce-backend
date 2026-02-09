const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

const listOrders = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("orders")
    .select("*, profiles!orders_user_id_fkey(id, email, full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Filters
  if (query.status) q = q.eq("status", query.status);
  if (query.payment_status) q = q.eq("payment_status", query.payment_status);
  if (query.user_id) q = q.eq("user_id", query.user_id);
  if (query.search) q = q.ilike("order_number", `%${query.search}%`);

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getOrder = async (id) => {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, profiles!orders_user_id_fkey(id, email, full_name)")
    .eq("id", id)
    .single();

  if (error || !order) throw new HttpError("Order not found", 404, "NotFound");

  // Get order items with variant info
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(id, name, image_url), product_variants(id, size, color)")
    .eq("order_id", id);

  return { ...order, items: items || [] };
};

const updateOrder = async (id, body) => {
  const { status, payment_status, notes, shipping_address } = body;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Order not found", 404, "NotFound");

  const updates = {};
  if (status !== undefined) updates.status = status;
  if (payment_status !== undefined) updates.payment_status = payment_status;
  if (notes !== undefined) updates.notes = notes;
  if (shipping_address !== undefined) updates.shipping_address = shipping_address;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const deleteOrder = async (id) => {
  const { data: existing } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Order not found", 404, "NotFound");

  if (existing.status !== "pending" && existing.status !== "cancelled") {
    throw new HttpError("Can only delete pending or cancelled orders", 400, "BadRequest");
  }

  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Order deleted successfully" };
};

module.exports = {
  adminOrdersService: { listOrders, getOrder, updateOrder, deleteOrder },
};
