const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { adminCategoriesController } = require("./categories.controller");

const router = express.Router();

router.get("/", adminAuth("categories", "can_view"), adminCategoriesController.list);
router.get("/:id", adminAuth("categories", "can_view"), adminCategoriesController.get);
router.post("/", adminAuth("categories", "can_create"), adminCategoriesController.create);
router.put("/:id", adminAuth("categories", "can_update"), adminCategoriesController.update);
router.delete("/:id", adminAuth("categories", "can_delete"), adminCategoriesController.remove);

module.exports = router;
