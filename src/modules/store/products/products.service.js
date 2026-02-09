const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

/**
 * Store Products - public facing (sirf active products)
 */

const listProducts = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("products")
    .select("id, name, slug, description, price, compare_at_price, image_url, category_id, categories(id, name, slug)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Filters
  if (query.category) q = q.eq("categories.slug", query.category);
  if (query.category_id) q = q.eq("category_id", query.category_id);
  if (query.search) q = q.ilike("name", `%${query.search}%`);
  if (query.min_price) q = q.gte("price", query.min_price);
  if (query.max_price) q = q.lte("price", query.max_price);

  // Sorting
  if (query.sort === "price_asc") q = q.order("price", { ascending: true });
  else if (query.sort === "price_desc") q = q.order("price", { ascending: false });
  else if (query.sort === "name") q = q.order("name", { ascending: true });

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new HttpError("Product not found", 404, "NotFound");

  return data;
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new HttpError("Product not found", 404, "NotFound");

  return data;
};

module.exports = {
  storeProductsService: { listProducts, getProductBySlug, getProductById },
};
