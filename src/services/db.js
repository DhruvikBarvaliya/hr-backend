const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');

async function connectDB() {
  mongoose.set('strictQuery', false);
  try {
    await mongoose.connect(config.mongoUri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    // extra diagnostics
    logger.error('MongoDB connection failed. MONGO_URI=%s', config.mongoUri);
    if (err.message && err.message.includes('ECONNREFUSED')) {
      logger.error('Connection refused. Is mongod running? Try `mongosh %s` or ensure service is started.', config.mongoUri);
    }
    throw err;
  }
}

async function closeDB() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error disconnecting MongoDB: %o', err);
  }
}

module.exports = { connectDB, closeDB };
