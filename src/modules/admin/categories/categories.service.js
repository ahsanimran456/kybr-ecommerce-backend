const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");
const { slugify } = require("../../../utils/slugify");
const { uploadFile, deleteFile } = require("../../../utils/storage");

const listCategories = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  let q = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.search) q = q.ilike("name", `%${query.search}%`);
  if (query.is_active !== undefined) q = q.eq("is_active", query.is_active === "true");

  const { data, error, count } = await q;

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

const getCategory = async (id) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw new HttpError("Category not found", 404, "NotFound");

  return data;
};

const createCategory = async (body, file) => {
  const { name, description, is_active } = body;

  if (!name) throw new HttpError("Name is required", 400, "BadRequest");

  const slug = slugify(name);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    throw new HttpError("Category with this name already exists", 400, "BadRequest");
  }

  // Upload image to Supabase Storage
  let image_url = "";
  if (file) {
    image_url = await uploadFile("categories", file);
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description: description || "",
      image_url,
      is_active: is_active !== undefined ? is_active === "true" || is_active === true : true,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const updateCategory = async (id, body, file) => {
  const { name, description, is_active } = body;

  const { data: existing } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Category not found", 404, "NotFound");

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (description !== undefined) updates.description = description;
  if (is_active !== undefined) updates.is_active = is_active === "true" || is_active === true;

  // Upload new image if provided
  if (file) {
    // Delete old image from storage
    if (existing.image_url) {
      await deleteFile("categories", existing.image_url);
    }
    updates.image_url = await uploadFile("categories", file);
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

const deleteCategory = async (id) => {
  const { data: existing } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) throw new HttpError("Category not found", 404, "NotFound");

  // Delete image from storage
  if (existing.image_url) {
    await deleteFile("categories", existing.image_url);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return { message: "Category deleted successfully" };
};

module.exports = {
  adminCategoriesService: { listCategories, getCategory, createCategory, updateCategory, deleteCategory },
};
