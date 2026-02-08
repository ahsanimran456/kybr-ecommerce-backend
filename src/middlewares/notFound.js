const notFound = (req, res, next) => {
  res.status(404).json({
    error: "NotFound",
    message: "Route not found",
  });
};

module.exports = { notFound };
