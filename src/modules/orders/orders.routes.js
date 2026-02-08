const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const { listOrders, createOrder, getOrder } = require("./orders.controller");

const router = express.Router();

router.get("/", asyncHandler(listOrders));
router.post("/", asyncHandler(createOrder));
router.get("/:id", asyncHandler(getOrder));

module.exports = router;
