const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (!err) return res.status(500).json({ error: 'Unknown error' });

  if (err instanceof ApiError) {
    logger.warn('API error: %s %o', err.message, err.meta || {});
    return res.status(err.status).json({ error: err.message, meta: err.meta || null });
  }

  // validation errors (Joi)
  if (err.isJoi) {
    logger.warn('Validation error: %o', err.details || err);
    return res.status(400).json({ error: 'Validation error', details: err.details || err.message });
  }

  // mongoose CastError or ValidationError
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    logger.warn('Mongoose validation error: %o', err);
    return res.status(400).json({ error: err.message });
  }

  // fallback
  logger.error('Unhandled error: %o', err);
  return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};
