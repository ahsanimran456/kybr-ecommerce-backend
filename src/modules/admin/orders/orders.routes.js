const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { adminOrdersController } = require("./orders.controller");

const router = express.Router();

router.get("/", adminAuth("orders", "can_view"), adminOrdersController.list);
router.get("/:id", adminAuth("orders", "can_view"), adminOrdersController.get);
router.put("/:id", adminAuth("orders", "can_update"), adminOrdersController.update);
router.delete("/:id", adminAuth("orders", "can_delete"), adminOrdersController.remove);

module.exports = router;
