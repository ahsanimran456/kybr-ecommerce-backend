const { supabase } = require("../../config/supabase");

const listUsers = async () => {
  return {
    items: [],
    message: "Use Supabase admin API to list users",
  };
};

const listProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    return { items: [], error: error.message };
  }
  return { items: data };
};

const listOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) {
    return { items: [], error: error.message };
  }
  return { items: data };
};

module.exports = { adminService: { listUsers, listProducts, listOrders } };
