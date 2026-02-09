const express = require("express");
const { auth } = require("../../../middlewares/auth");
const { storeProfileController } = require("./profile.controller");

const router = express.Router();

// All profile routes need authentication
router.use(auth);

router.get("/me", storeProfileController.getProfile);
router.put("/me", storeProfileController.updateProfile);

module.exports = router;
