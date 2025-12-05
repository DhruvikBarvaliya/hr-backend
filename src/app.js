// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const setupSwagger = require('./swagger/swagger');
const { connectDB, closeDB } = require('./services/db'); // see note below
const errorHandler = require('./middlewares/errorHandler');
const scheduler = require('./services/scheduler');

const app = express();

// --- Core middleware (order matters) ---
app.use(helmet());
app.use(cors());
app.use(express.json());
// HTTP request logging (morgan)
app.use(morgan('combined'));

// Swagger (docs)
setupSwagger(app);

// Mount API routes
app.use('/api/v1', require('./routes/index'));

// Health endpoint (always available)
app.get('/health', (req, res) => res.json({ status: 'ok', env: config.env }));

// --- Global error handler (must be AFTER routes) ---
app.use(errorHandler);

// --- Start / stop helpers ---
let serverInstance = null;
let schedulerTask = null;

async function start() {
  try {
    // 1) Connect to DB (await)
    await connectDB();
    logger.info('Database connected, continuing startup...');

    // 2) Start scheduler AFTER DB connected (scheduler may query DB)
    // scheduler.startScheduler returns the cron task (optional) for shutdown
    if (scheduler && typeof scheduler.startScheduler === 'function') {
      schedulerTask = scheduler.startScheduler();
      logger.info('Scheduler started');
    }

    // 3) Start HTTP server
    const port = config.port || 4000;
    serverInstance = app.listen(port, () => {
      logger.info(`Server listening on port ${port} (env: ${config.env})`);
    });
  } catch (err) {
    logger.error('Failed to start server: %o', err);
    // If DB connect failed, ensure we shut down
    process.exit(1);
  }
}

async function stop(signal) {
  try {
    logger.info('Shutting down. Signal: %s', signal);
    if (serverInstance) {
      // stop accepting new connections
      serverInstance.close(() => {
        logger.info('HTTP server closed');
      });
    }

    // stop scheduler if it returned a controllable task
    if (schedulerTask && typeof schedulerTask.stop === 'function') {
      try {
        schedulerTask.stop();
        logger.info('Scheduler stopped');
      } catch (e) {
        logger.warn('Failed to stop scheduler cleanly: %o', e);
      }
    }

    // close DB connection
    if (typeof closeDB === 'function') {
      await closeDB();
      logger.info('Database connection closed');
    }

    // give some time then exit
    setTimeout(() => {
      logger.info('Exiting process');
      process.exit(0);
    }, 500);
  } catch (err) {
    logger.error('Error during shutdown: %o', err);
    process.exit(1);
  }
}

// Only start if run directly (not when required by tests)
if (require.main === module) {
  start();

  // graceful shutdown signals
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
}

module.exports = app;
