const insightService = require('../services/insight.service');
const { User } = require('../models');
const logger = require('../utils/logger');

const generateMonthlyInsightsForAllUsers = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const users = await User.find({ isActive: true }).select('_id');
    logger.info(`Generating monthly insights for ${users.length} users`);

    for (const user of users) {
      try {
        await insightService.generate(user._id.toString(), { month, year });
      } catch (error) {
        logger.error(`Insight generation failed for user ${user._id}:`, error);
      }
    }

    logger.info('Monthly insights generation completed');
  } catch (error) {
    logger.error('Monthly insights job failed:', error);
  }
};

module.exports = { generateMonthlyInsightsForAllUsers };
