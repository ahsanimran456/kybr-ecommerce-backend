class HttpError extends Error {
  constructor(message, status = 500, name = "HttpError") {
    super(message);
    this.status = status;
    this.name = name;
  }
}

module.exports = { HttpError };
