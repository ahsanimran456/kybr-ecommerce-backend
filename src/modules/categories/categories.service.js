const { supabase } = require("../../config/supabase");

const listCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    return { items: [], error: error.message };
  }
  return { items: data };
};

module.exports = { categoriesService: { listCategories } };
