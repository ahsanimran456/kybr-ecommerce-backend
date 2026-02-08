const { cartService } = require("./cart.service");

const getCart = async (req, res) => {
  const data = await cartService.getCart();
  res.json(data);
};

const addItem = async (req, res) => {
  const data = await cartService.addItem(req.body);
  res.status(201).json(data);
};

const removeItem = async (req, res) => {
  const data = await cartService.removeItem(req.params.id);
  res.json(data);
};

module.exports = { getCart, addItem, removeItem };
