const express = require("express");
const { storeCategoriesController } = require("./categories.controller");

const router = express.Router();

// Public routes
router.get("/", storeCategoriesController.list);
router.get("/:slug", storeCategoriesController.getBySlug);

module.exports = router;
