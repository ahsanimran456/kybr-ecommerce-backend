const { asyncHandler } = require("../../../utils/asyncHandler");
const { storeProductsService } = require("./products.service");

const list = asyncHandler(async (req, res) => {
  const result = await storeProductsService.listProducts(req.query);
  res.json({ success: true, data: result });
});

const getBySlug = asyncHandler(async (req, res) => {
  const result = await storeProductsService.getProductBySlug(req.params.slug);
  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const result = await storeProductsService.getProductById(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { storeProductsController: { list, getBySlug, getById } };
