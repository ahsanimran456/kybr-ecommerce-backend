const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || "InternalServerError",
    message: err.message || "Unexpected error",
  });
};

module.exports = { errorHandler };
