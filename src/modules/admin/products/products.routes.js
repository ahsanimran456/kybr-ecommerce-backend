const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { adminProductsController } = require("./products.controller");

const router = express.Router();

router.get("/", adminAuth("products", "can_view"), adminProductsController.list);
router.get("/:id", adminAuth("products", "can_view"), adminProductsController.get);
router.post("/", adminAuth("products", "can_create"), adminProductsController.create);
router.put("/:id", adminAuth("products", "can_update"), adminProductsController.update);
router.delete("/:id", adminAuth("products", "can_delete"), adminProductsController.remove);

module.exports = router;
