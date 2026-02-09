const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authController } = require("./auth.controller");

const router = express.Router();

// POST /api/v1/auth/login          - Store website login
// POST /api/v1/auth/admin/login    - Admin dashboard login
// POST /api/v1/auth/register       - Customer registration
// GET  /api/v1/auth/me             - Get current user (needs token)

router.post("/login", authController.login);
router.post("/admin/login", authController.adminLogin);
router.post("/register", authController.register);
router.get("/me", auth, authController.getMe);

module.exports = router;
