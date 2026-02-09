const { asyncHandler } = require("../../../utils/asyncHandler");
const { storeCategoriesService } = require("./categories.service");

const list = asyncHandler(async (req, res) => {
  const data = await storeCategoriesService.listCategories();
  res.json({ success: true, data });
});

const getBySlug = asyncHandler(async (req, res) => {
  const data = await storeCategoriesService.getCategoryBySlug(req.params.slug);
  res.json({ success: true, data });
});

module.exports = { storeCategoriesController: { list, getBySlug } };
