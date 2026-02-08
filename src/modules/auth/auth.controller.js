const { authService } = require("./auth.service");

const login = async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json(data);
};

const register = async (req, res) => {
  const { email, password, metadata } = req.body;
  const data = await authService.register(email, password, metadata);
  res.status(201).json(data);
};

module.exports = { login, register };
