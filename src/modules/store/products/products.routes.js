const express = require("express");
const { storeProductsController } = require("./products.controller");

const router = express.Router();

// Public routes - no auth needed
router.get("/", storeProductsController.list);
router.get("/slug/:slug", storeProductsController.getBySlug);
router.get("/:id", storeProductsController.getById);

module.exports = router;
