const express = require("express");
const { auth } = require("../../../middlewares/auth");
const { storeCartController } = require("./cart.controller");

const router = express.Router();

// All cart routes need authentication
router.use(auth);

router.get("/", storeCartController.getCart);
router.post("/items", storeCartController.addItem);
router.put("/items/:id", storeCartController.updateItem);
router.delete("/items/:id", storeCartController.removeItem);
router.delete("/clear", storeCartController.clearCart);

module.exports = router;
