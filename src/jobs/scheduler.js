const cron = require('node-cron');
const { generateMonthlyInsightsForAllUsers } = require('./monthlyInsights.job');
const recurringExpenseService = require('../services/recurringExpense.service');
const logger = require('../utils/logger');

const startScheduledJobs = () => {
  // Monthly insights — 1st of each month at 02:00
  cron.schedule('0 2 1 * *', async () => {
    logger.info('Cron: starting monthly insights job');
    await generateMonthlyInsightsForAllUsers();
  });

  // Recurring expenses — every day at 06:00
  cron.schedule('0 6 * * *', async () => {
    logger.info('Cron: processing due recurring expenses');
    try {
      const result = await recurringExpenseService.processDue();
      logger.info(`Cron: generated ${result.generated} recurring expenses`);
    } catch (error) {
      logger.error('Cron: recurring expenses job failed', error);
    }
  });

  logger.info('Scheduled jobs registered (monthly insights, recurring expenses)');
};

module.exports = { startScheduledJobs };
