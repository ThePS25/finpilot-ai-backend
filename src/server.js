const app = require('./app');
const connectDB = require('./config/database');
const env = require('./config/env');
const logger = require('./utils/logger');
const { startScheduledJobs } = require('./jobs/scheduler');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`FinPilot AI server running on port ${env.port} [${env.env}]`);
    startScheduledJobs();
  });

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
