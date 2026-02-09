const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");

/**
 * Store Categories - public facing (sirf active categories)
 */

const listCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new HttpError("Category not found", 404, "NotFound");

  return data;
};

module.exports = {
  storeCategoriesService: { listCategories, getCategoryBySlug },
};
