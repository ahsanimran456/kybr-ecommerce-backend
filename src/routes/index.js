const express = require("express");

const { auth } = require("../middlewares/auth");

// Health
const healthRoutes = require("../modules/health/health.routes");

// Auth
const authRoutes = require("../modules/auth/auth.routes");

// Store (E-commerce Website) - public + authenticated
const storeProductRoutes = require("../modules/store/products/products.routes");
const storeCategoryRoutes = require("../modules/store/categories/categories.routes");
const storeCartRoutes = require("../modules/store/cart/cart.routes");
const storeOrderRoutes = require("../modules/store/orders/orders.routes");
const storeProfileRoutes = require("../modules/store/profile/profile.routes");

// Admin (Dashboard) - admin authenticated only
const adminDashboardRoutes = require("../modules/admin/dashboard/dashboard.routes");
const adminAdminsRoutes = require("../modules/admin/admins/admins.routes");
const adminProductRoutes = require("../modules/admin/products/products.routes");
const adminCategoryRoutes = require("../modules/admin/categories/categories.routes");
const adminCustomerRoutes = require("../modules/admin/customers/customers.routes");
const adminOrderRoutes = require("../modules/admin/orders/orders.routes");

const router = express.Router();

// ── Health ─────────────────────────────────────
router.use("/health", healthRoutes);

// ── Auth ───────────────────────────────────────
router.use("/auth", authRoutes);

// ── Store (Public + Customer Auth) ─────────────
router.use("/store/products", storeProductRoutes);
router.use("/store/categories", storeCategoryRoutes);
router.use("/store/cart", storeCartRoutes);
router.use("/store/orders", storeOrderRoutes);
router.use("/store/profile", storeProfileRoutes);

// ── Admin Dashboard (Admin Auth Required) ──────
// All admin routes need auth middleware first
router.use("/admin", auth);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/admins", adminAdminsRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/customers", adminCustomerRoutes);
router.use("/admin/orders", adminOrderRoutes);

module.exports = router;
