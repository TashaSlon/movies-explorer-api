class NotAuthError extends Error {
  constructor(err) {
    super(err);
    this.message = err;
    this.statusCode = 401;
  }
}

module.exports = NotAuthError;
