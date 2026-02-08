const express = require("express");

const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/users.routes");
const productRoutes = require("../modules/products/products.routes");
const categoryRoutes = require("../modules/categories/categories.routes");
const cartRoutes = require("../modules/cart/cart.routes");
const orderRoutes = require("../modules/orders/orders.routes");
const paymentRoutes = require("../modules/payments/payments.routes");
const adminRoutes = require("../modules/admin/admin.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

router.use("/store/users", userRoutes);
router.use("/store/products", productRoutes);
router.use("/store/categories", categoryRoutes);
router.use("/store/cart", cartRoutes);
router.use("/store/orders", orderRoutes);
router.use("/store/payments", paymentRoutes);

router.use("/admin", adminRoutes);

module.exports = router;
