const { asyncHandler } = require("../../../utils/asyncHandler");
const { adminOrdersService } = require("./orders.service");

const list = asyncHandler(async (req, res) => {
  const result = await adminOrdersService.listOrders(req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await adminOrdersService.getOrder(req.params.id);
  res.json({ success: true, data: result });
});

const update = asyncHandler(async (req, res) => {
  const result = await adminOrdersService.updateOrder(req.params.id, req.body);
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminOrdersService.deleteOrder(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { adminOrdersController: { list, get, update, remove } };
