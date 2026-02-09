const { supabase } = require("../config/supabase");
const { HttpError } = require("../utils/httpError");

/**
 * Admin Auth Middleware
 * Check karta hai ke user admin/super_admin hai
 * + specific module ka permission hai ya nahi
 *
 * Usage:
 *   router.get("/products", adminAuth("products", "can_view"), controller)
 *   router.post("/products", adminAuth("products", "can_create"), controller)
 *   router.put("/products/:id", adminAuth("products", "can_update"), controller)
 *   router.delete("/products/:id", adminAuth("products", "can_delete"), controller)
 */
const adminAuth = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        throw new HttpError("Authentication required", 401, "Unauthorized");
      }

      // Customer ko admin routes pe access nahi
      if (user.role === "customer") {
        throw new HttpError("Admin access required", 403, "Forbidden");
      }

      // super_admin ko sab kuch ka access hai - no permission check needed
      if (user.role === "super_admin") {
        return next();
      }

      // admin role ke liye specific permission check karo
      if (user.role === "admin") {
        const { data: permission, error } = await supabase
          .from("admin_permissions")
          .select("*")
          .eq("admin_id", user.id)
          .eq("module", module)
          .single();

        if (error || !permission) {
          throw new HttpError(
            `You don't have access to ${module} module`,
            403,
            "Forbidden"
          );
        }

        if (!permission[action]) {
          throw new HttpError(
            `You don't have ${action.replace("can_", "")} permission for ${module}`,
            403,
            "Forbidden"
          );
        }

        // Attach permissions to request for use in controllers
        req.adminPermissions = permission;
        return next();
      }

      throw new HttpError("Access denied", 403, "Forbidden");
    } catch (error) {
      if (error instanceof HttpError) {
        return next(error);
      }
      next(new HttpError("Authorization failed", 403, "Forbidden"));
    }
  };
};

module.exports = { adminAuth };
