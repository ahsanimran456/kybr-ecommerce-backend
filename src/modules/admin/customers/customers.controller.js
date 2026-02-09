const { asyncHandler } = require("../../../utils/asyncHandler");
const { adminCustomersService } = require("./customers.service");

const list = asyncHandler(async (req, res) => {
  const result = await adminCustomersService.listCustomers(req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await adminCustomersService.getCustomer(req.params.id);
  res.json({ success: true, data: result });
});

const update = asyncHandler(async (req, res) => {
  const result = await adminCustomersService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminCustomersService.deleteCustomer(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { adminCustomersController: { list, get, update, remove } };
