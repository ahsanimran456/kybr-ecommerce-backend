const { asyncHandler } = require("../../../utils/asyncHandler");
const { storeOrdersService } = require("./orders.service");

const list = asyncHandler(async (req, res) => {
  const result = await storeOrdersService.listOrders(req.user.id, req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await storeOrdersService.getOrder(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const result = await storeOrdersService.createOrder(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});

module.exports = { storeOrdersController: { list, get, create } };
