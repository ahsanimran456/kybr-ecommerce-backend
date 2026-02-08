const { supabase } = require("../../config/supabase");

const listOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) {
    return { items: [], error: error.message };
  }
  return { items: data };
};

const createOrder = async (payload) => {
  return {
    created: false,
    payload,
    message: "Implement order creation with inventory checks",
  };
};

const getOrder = async (id) => {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) {
    return { item: null, error: error.message };
  }
  return { item: data };
};

module.exports = { ordersService: { listOrders, createOrder, getOrder } };
