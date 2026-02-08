const { ordersService } = require("./orders.service");

const listOrders = async (req, res) => {
  const data = await ordersService.listOrders();
  res.json(data);
};

const createOrder = async (req, res) => {
  const data = await ordersService.createOrder(req.body);
  res.status(201).json(data);
};

const getOrder = async (req, res) => {
  const data = await ordersService.getOrder(req.params.id);
  res.json(data);
};

module.exports = { listOrders, createOrder, getOrder };
