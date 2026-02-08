const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const { listCategories } = require("./categories.controller");

const router = express.Router();

router.get("/", asyncHandler(listCategories));

module.exports = router;
