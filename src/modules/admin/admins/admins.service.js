const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");
const { parsePagination } = require("../../../utils/pagination");

/**
 * List all admins (super_admin + admin role)
 */
const listAdmins = async (query) => {
  const { from, to, page, limit } = parsePagination(query);

  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", ["super_admin", "admin"])
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return {
    items: data,
    pagination: { page, limit, total: count },
  };
};

/**
 * Get single admin with permissions
 */
const getAdmin = async (id) => {
  const { data: admin, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .in("role", ["super_admin", "admin"])
    .single();

  if (error || !admin) throw new HttpError("Admin not found", 404, "NotFound");

  // Get permissions
  const { data: permissions } = await supabase
    .from("admin_permissions")
    .select("*")
    .eq("admin_id", id);

  return { ...admin, permissions: permissions || [] };
};

/**
 * Create a new admin user
 * 1. Supabase Auth mein user create karo
 * 2. Profile mein role update karo
 * 3. Permissions assign karo
 */
const createAdmin = async (body) => {
  const { email, password, full_name, phone, role, permissions } = body;

  if (!email || !password) {
    throw new HttpError("Email and password are required", 400, "BadRequest");
  }

  // Only allow admin role (super_admin sirf seed se banega)
  const adminRole = role === "super_admin" ? "super_admin" : "admin";

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || "" },
  });

  if (authError) throw new HttpError(authError.message, 400, "BadRequest");

  const userId = authData.user.id;

  // 2. Update profile role
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: adminRole,
      full_name: full_name || "",
      phone: phone || "",
    })
    .eq("id", userId);

  if (profileError) throw new HttpError(profileError.message, 400, "BadRequest");

  // 3. Assign permissions (only for admin role, super_admin has all)
  if (adminRole === "admin" && permissions && permissions.length > 0) {
    const permissionRows = permissions.map((perm) => ({
      admin_id: userId,
      module: perm.module,
      can_view: perm.can_view || false,
      can_create: perm.can_create || false,
      can_update: perm.can_update || false,
      can_delete: perm.can_delete || false,
    }));

    const { error: permError } = await supabase
      .from("admin_permissions")
      .insert(permissionRows);

    if (permError) throw new HttpError(permError.message, 400, "BadRequest");
  }

  return getAdmin(userId);
};

/**
 * Update admin profile + permissions
 */
const updateAdmin = async (id, body) => {
  const { full_name, phone, is_active, role, permissions } = body;

  // Check admin exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .in("role", ["super_admin", "admin"])
    .single();

  if (!existing) throw new HttpError("Admin not found", 404, "NotFound");

  // Update profile
  const updates = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (is_active !== undefined) updates.is_active = is_active;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (error) throw new HttpError(error.message, 400, "BadRequest");
  }

  // Update permissions if provided
  if (permissions && Array.isArray(permissions)) {
    // Delete old permissions
    await supabase.from("admin_permissions").delete().eq("admin_id", id);

    // Insert new permissions
    if (permissions.length > 0) {
      const permissionRows = permissions.map((perm) => ({
        admin_id: id,
        module: perm.module,
        can_view: perm.can_view || false,
        can_create: perm.can_create || false,
        can_update: perm.can_update || false,
        can_delete: perm.can_delete || false,
      }));

      const { error: permError } = await supabase
        .from("admin_permissions")
        .insert(permissionRows);

      if (permError) throw new HttpError(permError.message, 400, "BadRequest");
    }
  }

  return getAdmin(id);
};

/**
 * Delete admin - deactivate (soft delete)
 */
const deleteAdmin = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new HttpError("Cannot delete yourself", 400, "BadRequest");
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .in("role", ["super_admin", "admin"])
    .single();

  if (!existing) throw new HttpError("Admin not found", 404, "NotFound");

  // Deactivate the admin
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  // Remove permissions
  await supabase.from("admin_permissions").delete().eq("admin_id", id);

  return { message: "Admin deactivated successfully" };
};

module.exports = {
  adminsService: { listAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin },
};
