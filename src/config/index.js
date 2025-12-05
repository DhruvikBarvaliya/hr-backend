const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrdb',
  jwtSecret: process.env.JWT_SECRET || 'change_this',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxCarryForward: Number(process.env.MAX_CARRY_FORWARD || 12),
};
