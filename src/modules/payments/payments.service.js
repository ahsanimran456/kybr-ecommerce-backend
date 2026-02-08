const createPayment = async (payload) => {
  return {
    created: false,
    payload,
    message: "Integrate payment gateway of choice",
  };
};

const verifyPayment = async (payload) => {
  return {
    verified: false,
    payload,
    message: "Verify payment with gateway webhook",
  };
};

module.exports = { paymentsService: { createPayment, verifyPayment } };
