const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

/**
 * Store Products - public facing (sirf active products + variants)
 */

const listProducts = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("products")
    .select("id, name, slug, description, price, compare_at_price, image_url, category_id, categories(id, name, slug), product_variants(id, size, color, stock, price)", { count: "exact" })
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

  // Filter only active variants
  const items = (data || []).map((product) => ({
    ...product,
    product_variants: (product.product_variants || []).filter((v) => v.stock > 0),
    available_sizes: [...new Set((product.product_variants || []).filter((v) => v.stock > 0).map((v) => v.size))],
    available_colors: [...new Set((product.product_variants || []).filter((v) => v.stock > 0).map((v) => v.color))],
  }));

  return {
    items,
    pagination: { page, limit, total: count },
  };
};

const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug), product_variants(id, size, color, stock, price, sku, is_active)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new HttpError("Product not found", 404, "NotFound");

  // Add available sizes and colors
  const activeVariants = (data.product_variants || []).filter((v) => v.is_active && v.stock > 0);

  return {
    ...data,
    available_sizes: [...new Set(activeVariants.map((v) => v.size))],
    available_colors: [...new Set(activeVariants.map((v) => v.color))],
    product_variants: activeVariants,
  };
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug), product_variants(id, size, color, stock, price, sku, is_active)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new HttpError("Product not found", 404, "NotFound");

  const activeVariants = (data.product_variants || []).filter((v) => v.is_active && v.stock > 0);

  return {
    ...data,
    available_sizes: [...new Set(activeVariants.map((v) => v.size))],
    available_colors: [...new Set(activeVariants.map((v) => v.color))],
    product_variants: activeVariants,
  };
};

module.exports = {
  storeProductsService: { listProducts, getProductBySlug, getProductById },
};
