class AbstractError extends Error {
  constructor(err) {
    super(err);
    this.message = err;
    this.statusCode = 500;
  }
}

module.exports = AbstractError;
