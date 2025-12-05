// src/services/scheduler.js
const cron = require('node-cron');
const leaveService = require('./leaveService');
const logger = require('../utils/logger');

function startScheduler() {
  const expr = process.env.ACCRUAL_CRON || '5 0 1 * *';
  logger.info('Starting scheduler (expr=%s)', expr);
  const task = cron.schedule(expr, async () => {
    try {
      logger.info('Running monthly accrual job');
      await leaveService.accrueMonthlyForAll();
      logger.info('Accrual job finished');
    } catch (err) {
      logger.error('Accrual job failed: %o', err);
    }
  }, { timezone: process.env.TIMEZONE || 'Asia/Kolkata' });

  // return the task so caller can stop it
  return task;
}

module.exports = { startScheduler };
