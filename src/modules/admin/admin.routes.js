const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const {
  listUsers,
  listProducts,
  listOrders,
} = require("./admin.controller");

const router = express.Router();

router.get("/users", asyncHandler(listUsers));
router.get("/products", asyncHandler(listProducts));
router.get("/orders", asyncHandler(listOrders));

module.exports = router;
