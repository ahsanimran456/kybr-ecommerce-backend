const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const { createPayment, verifyPayment } = require("./payments.controller");

const router = express.Router();

router.post("/", asyncHandler(createPayment));
router.post("/verify", asyncHandler(verifyPayment));

module.exports = router;
