const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

const listCustomers = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.search) {
    q = q.or(`email.ilike.%${query.search}%,full_name.ilike.%${query.search}%`);
  }
  if (query.is_active !== undefined) q = q.eq("is_active", query.is_active === "true");

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getCustomer = async (id) => {
  const { data: customer, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (error || !customer) throw new HttpError("Customer not found", 404, "NotFound");

  // Get customer's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return { ...customer, recent_orders: orders || [] };
};

const updateCustomer = async (id, body) => {
  const { full_name, phone, is_active } = body;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (!existing) throw new HttpError("Customer not found", 404, "NotFound");

  const updates = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const deleteCustomer = async (id) => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (!existing) throw new HttpError("Customer not found", 404, "NotFound");

  // Soft delete - deactivate
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Customer deactivated successfully" };
};

module.exports = {
  adminCustomersService: { listCustomers, getCustomer, updateCustomer, deleteCustomer },
};
