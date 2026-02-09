const { asyncHandler } = require("../../utils/asyncHandler");
const { authService } = require("./auth.service");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.adminLogin(email, password);
  res.json({ success: true, data: result });
});

const register = asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;
  const result = await authService.register(email, password, { full_name });
  res.status(201).json({ success: true, data: result });
});

const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  res.json({ success: true, data: result });
});

module.exports = { authController: { login, adminLogin, register, getMe } };
