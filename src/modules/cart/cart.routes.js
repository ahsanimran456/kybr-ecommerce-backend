const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const { getCart, addItem, removeItem } = require("./cart.controller");

const router = express.Router();

router.get("/", asyncHandler(getCart));
router.post("/items", asyncHandler(addItem));
router.delete("/items/:id", asyncHandler(removeItem));

module.exports = router;
