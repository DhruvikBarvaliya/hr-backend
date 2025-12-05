// src/services/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');

async function connectDB() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.mongoUri, {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  logger.info('MongoDB connected');
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
