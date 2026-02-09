const { asyncHandler } = require("../../../utils/asyncHandler");
const { adminCategoriesService } = require("./categories.service");

const list = asyncHandler(async (req, res) => {
  const result = await adminCategoriesService.listCategories(req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await adminCategoriesService.getCategory(req.params.id);
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  // req.file = multer se aata hai (single image)
  // req.body = name, description, is_active (FormData se)
  const result = await adminCategoriesService.createCategory(req.body, req.file);
  res.status(201).json({ success: true, data: result });
});

const update = asyncHandler(async (req, res) => {
  const result = await adminCategoriesService.updateCategory(req.params.id, req.body, req.file);
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminCategoriesService.deleteCategory(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { adminCategoriesController: { list, get, create, update, remove } };
