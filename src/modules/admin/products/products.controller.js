const { asyncHandler } = require("../../../utils/asyncHandler");
const { adminProductsService } = require("./products.service");

const list = asyncHandler(async (req, res) => {
  const result = await adminProductsService.listProducts(req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await adminProductsService.getProduct(req.params.id);
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const result = await adminProductsService.createProduct(req.body);
  res.status(201).json({ success: true, data: result });
});

const update = asyncHandler(async (req, res) => {
  const result = await adminProductsService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminProductsService.deleteProduct(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { adminProductsController: { list, get, create, update, remove } };
