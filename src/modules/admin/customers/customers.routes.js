const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { adminCustomersController } = require("./customers.controller");

const router = express.Router();

router.get("/", adminAuth("customers", "can_view"), adminCustomersController.list);
router.get("/:id", adminAuth("customers", "can_view"), adminCustomersController.get);
router.put("/:id", adminAuth("customers", "can_update"), adminCustomersController.update);
router.delete("/:id", adminAuth("customers", "can_delete"), adminCustomersController.remove);

module.exports = router;
