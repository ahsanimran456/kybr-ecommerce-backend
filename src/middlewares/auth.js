const { supabase } = require("../config/supabase");
const { HttpError } = require("../utils/httpError");

/**
 * Auth Middleware - verify JWT token and attach user to req
 * Frontend se Bearer token aayega Authorization header mein
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError("Authentication required", 401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HttpError("Invalid or expired token", 401, "Unauthorized");
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new HttpError("User profile not found", 401, "Unauthorized");
    }

    if (!profile.is_active) {
      throw new HttpError("Account is deactivated", 403, "Forbidden");
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      full_name: profile.full_name,
      profile,
    };

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    next(new HttpError("Authentication failed", 401, "Unauthorized"));
  }
};

module.exports = { auth };
