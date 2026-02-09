const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { adminsController } = require("./admins.controller");

const router = express.Router();

// GET    /api/v1/admin/admins       - List all admins
// GET    /api/v1/admin/admins/:id   - Get admin detail
// POST   /api/v1/admin/admins       - Create new admin
// PUT    /api/v1/admin/admins/:id   - Update admin
// DELETE /api/v1/admin/admins/:id   - Deactivate admin

router.get("/", adminAuth("admins", "can_view"), adminsController.list);
router.get("/:id", adminAuth("admins", "can_view"), adminsController.get);
router.post("/", adminAuth("admins", "can_create"), adminsController.create);
router.put("/:id", adminAuth("admins", "can_update"), adminsController.update);
router.delete("/:id", adminAuth("admins", "can_delete"), adminsController.remove);

module.exports = router;
