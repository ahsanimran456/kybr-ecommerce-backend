const { adminService } = require("./admin.service");

const listUsers = async (req, res) => {
  const data = await adminService.listUsers();
  res.json(data);
};

const listProducts = async (req, res) => {
  const data = await adminService.listProducts();
  res.json(data);
};

const listOrders = async (req, res) => {
  const data = await adminService.listOrders();
  res.json(data);
};

module.exports = { listUsers, listProducts, listOrders };
