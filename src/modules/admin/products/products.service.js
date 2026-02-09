const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");
const { slugify } = require("../../../utils/slugify");

const listProducts = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Filters
  if (query.category_id) q = q.eq("category_id", query.category_id);
  if (query.is_active !== undefined) q = q.eq("is_active", query.is_active === "true");
  if (query.search) q = q.ilike("name", `%${query.search}%`);

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getProduct = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (error || !data) throw new HttpError("Product not found", 404, "NotFound");

  return data;
};

const createProduct = async (body) => {
  const { name, description, price, compare_at_price, category_id, image_url, images, sku, stock, is_active } = body;

  if (!name || price === undefined) {
    throw new HttpError("Name and price are required", 400, "BadRequest");
  }

  const slug = slugify(name) + "-" + Date.now();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || "",
      price,
      compare_at_price: compare_at_price || null,
      category_id: category_id || null,
      image_url: image_url || "",
      images: images || [],
      sku: sku || "",
      stock: stock || 0,
      is_active: is_active !== undefined ? is_active : true,
    })
    .select("*, categories(id, name, slug)")
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const updateProduct = async (id, body) => {
  const { name, description, price, compare_at_price, category_id, image_url, images, sku, stock, is_active } = body;

  // Check exists
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Product not found", 404, "NotFound");

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name) + "-" + Date.now();
  }
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price;
  if (category_id !== undefined) updates.category_id = category_id;
  if (image_url !== undefined) updates.image_url = image_url;
  if (images !== undefined) updates.images = images;
  if (sku !== undefined) updates.sku = sku;
  if (stock !== undefined) updates.stock = stock;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*, categories(id, name, slug)")
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const deleteProduct = async (id) => {
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Product not found", 404, "NotFound");

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Product deleted successfully" };
};

module.exports = {
  adminProductsService: { listProducts, getProduct, createProduct, updateProduct, deleteProduct },
};
