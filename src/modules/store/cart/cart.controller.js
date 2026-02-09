const { asyncHandler } = require("../../../utils/asyncHandler");
const { storeCartService } = require("./cart.service");

const getCart = asyncHandler(async (req, res) => {
  const result = await storeCartService.getCart(req.user.id);
  res.json({ success: true, data: result });
});

const addItem = asyncHandler(async (req, res) => {
  const result = await storeCartService.addItem(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});

const updateItem = asyncHandler(async (req, res) => {
  const result = await storeCartService.updateItem(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: result });
});

const removeItem = asyncHandler(async (req, res) => {
  const result = await storeCartService.removeItem(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

const clearCart = asyncHandler(async (req, res) => {
  const result = await storeCartService.clearCart(req.user.id);
  res.json({ success: true, data: result });
});

module.exports = { storeCartController: { getCart, addItem, updateItem, removeItem, clearCart } };
