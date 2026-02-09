const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");
const { slugify } = require("../../../utils/slugify");
const { uploadFile, uploadMultipleFiles, deleteFile } = require("../../../utils/storage");

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

const createProduct = async (body, files) => {
  const { name, description, price, compare_at_price, category_id, sku, stock, is_active } = body;

  if (!name || price === undefined) {
    throw new HttpError("Name and price are required", 400, "BadRequest");
  }

  const slug = slugify(name) + "-" + Date.now();

  // Upload images to Supabase Storage
  let image_url = "";
  let imageUrls = [];

  if (files && files.length > 0) {
    // First image = main image (image_url)
    // All images = gallery (images array)
    imageUrls = await uploadMultipleFiles("products", files);
    image_url = imageUrls[0]; // First image is main
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || "",
      price: parseFloat(price),
      compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
      category_id: category_id || null,
      image_url,
      images: imageUrls,
      sku: sku || "",
      stock: parseInt(stock) || 0,
      is_active: is_active !== undefined ? is_active === "true" || is_active === true : true,
    })
    .select("*, categories(id, name, slug)")
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const updateProduct = async (id, body, files) => {
  const { name, description, price, compare_at_price, category_id, sku, stock, is_active } = body;

  // Check exists
  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Product not found", 404, "NotFound");

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name) + "-" + Date.now();
  }
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price ? parseFloat(compare_at_price) : null;
  if (category_id !== undefined) updates.category_id = category_id;
  if (sku !== undefined) updates.sku = sku;
  if (stock !== undefined) updates.stock = parseInt(stock);
  if (is_active !== undefined) updates.is_active = is_active === "true" || is_active === true;

  // Upload new images if provided
  if (files && files.length > 0) {
    // Delete old images from storage
    if (existing.images && existing.images.length > 0) {
      for (const oldUrl of existing.images) {
        await deleteFile("products", oldUrl);
      }
    } else if (existing.image_url) {
      await deleteFile("products", existing.image_url);
    }

    const imageUrls = await uploadMultipleFiles("products", files);
    updates.image_url = imageUrls[0];
    updates.images = imageUrls;
  }

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
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Product not found", 404, "NotFound");

  // Delete images from storage
  if (existing.images && existing.images.length > 0) {
    for (const url of existing.images) {
      await deleteFile("products", url);
    }
  } else if (existing.image_url) {
    await deleteFile("products", existing.image_url);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Product deleted successfully" };
};

module.exports = {
  adminProductsService: { listProducts, getProduct, createProduct, updateProduct, deleteProduct },
};
