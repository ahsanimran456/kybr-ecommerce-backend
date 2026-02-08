const { categoriesService } = require("./categories.service");

const listCategories = async (req, res) => {
  const data = await categoriesService.listCategories();
  res.json(data);
};

module.exports = { listCategories };
