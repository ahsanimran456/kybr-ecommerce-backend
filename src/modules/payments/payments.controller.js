const { paymentsService } = require("./payments.service");

const createPayment = async (req, res) => {
  const data = await paymentsService.createPayment(req.body);
  res.status(201).json(data);
};

const verifyPayment = async (req, res) => {
  const data = await paymentsService.verifyPayment(req.body);
  res.json(data);
};

module.exports = { createPayment, verifyPayment };
