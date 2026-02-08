const express = require("express");

const { asyncHandler } = require("../../utils/asyncHandler");
const { getMe, updateMe } = require("./users.controller");

const router = express.Router();

router.get("/me", asyncHandler(getMe));
router.put("/me", asyncHandler(updateMe));

module.exports = router;
