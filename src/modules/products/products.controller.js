const { productsService } = require("./products.service");

const listProducts = async (req, res) => {
  const data = await productsService.listProducts(req.query);
  res.json(data);
};

const getProduct = async (req, res) => {
  const data = await productsService.getProduct(req.params.id);
  res.json(data);
};

module.exports = { listProducts, getProduct };
