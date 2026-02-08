const { supabase } = require("../../config/supabase");

const listProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    return { items: [], error: error.message };
  }
  return { items: data };
};

const getProduct = async (id) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) {
    return { item: null, error: error.message };
  }
  return { item: data };
};

module.exports = { productsService: { listProducts, getProduct } };
