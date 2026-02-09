const express = require("express");
const { auth } = require("../../../middlewares/auth");
const { storeOrdersController } = require("./orders.controller");

const router = express.Router();

// All order routes need authentication
router.use(auth);

router.get("/", storeOrdersController.list);
router.get("/:id", storeOrdersController.get);
router.post("/", storeOrdersController.create);

module.exports = router;
