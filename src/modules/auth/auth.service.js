const { supabase } = require("../../config/supabase");
const { HttpError } = require("../../utils/httpError");

/**
 * Login - for both admin dashboard and store website
 * Returns token + user profile with role
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new HttpError("Email and password are required", 400, "BadRequest");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new HttpError(error.message, 401, "Unauthorized");
  }

  // Get profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile && !profile.is_active) {
    throw new HttpError("Account is deactivated", 403, "Forbidden");
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || "customer",
      full_name: profile?.full_name || "",
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  };
};

/**
 * Admin Login - only admin/super_admin can login
 */
const adminLogin = async (email, password) => {
  const result = await login(email, password);

  if (result.user.role === "customer") {
    throw new HttpError("Admin access required", 403, "Forbidden");
  }

  // Get admin permissions
  let permissions = [];
  if (result.user.role === "admin") {
    const { data } = await supabase
      .from("admin_permissions")
      .select("*")
      .eq("admin_id", result.user.id);
    permissions = data || [];
  }

  return { ...result, permissions };
};

/**
 * Register - new customer registration (store website ke liye)
 */
const register = async (email, password, metadata = {}) => {
  if (!email || !password) {
    throw new HttpError("Email and password are required", 400, "BadRequest");
  }

  if (password.length < 6) {
    throw new HttpError("Password must be at least 6 characters", 400, "BadRequest");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata.full_name || "",
      },
    },
  });

  if (error) {
    throw new HttpError(error.message, 400, "BadRequest");
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      role: "customer",
    },
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }
      : null,
  };
};

/**
 * Get current user (me) - from token
 */
const getMe = async (userId) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new HttpError("Profile not found", 404, "NotFound");
  }

  // If admin, also get permissions
  let permissions = [];
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("admin_permissions")
      .select("*")
      .eq("admin_id", userId);
    permissions = data || [];
  }

  return { ...profile, permissions };
};

module.exports = { authService: { login, adminLogin, register, getMe } };
