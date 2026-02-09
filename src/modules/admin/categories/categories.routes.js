const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { uploadSingleImage } = require("../../../middlewares/upload");
const { adminCategoriesController } = require("./categories.controller");

const router = express.Router();

router.get("/", adminAuth("categories", "can_view"), adminCategoriesController.list);
router.get("/:id", adminAuth("categories", "can_view"), adminCategoriesController.get);
router.post("/", adminAuth("categories", "can_create"), uploadSingleImage, adminCategoriesController.create);
router.put("/:id", adminAuth("categories", "can_update"), uploadSingleImage, adminCategoriesController.update);
router.delete("/:id", adminAuth("categories", "can_delete"), adminCategoriesController.remove);

module.exports = router;
