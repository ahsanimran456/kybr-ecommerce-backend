const express = require("express");
const { adminAuth } = require("../../../middlewares/adminAuth");
const { dashboardController } = require("./dashboard.controller");

const router = express.Router();

// GET /api/v1/admin/dashboard/stats
router.get("/stats", adminAuth("dashboard", "can_view"), dashboardController.getStats);

module.exports = router;
