class ApiError extends Error {
  /**
   * @param {Number} status HTTP status code
   * @param {String} message Error message
   * @param {Object} [meta] Optional metadata
   */
  constructor(status, message, meta = null) {
    super(message);
    this.status = status;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
