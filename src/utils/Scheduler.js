import cron from 'node-cron';
import { logger } from './Logger.js';

export class Scheduler {
  static scheduleTask(cronExpression, taskFunction) {
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: "${cronExpression}"`);
    }

    logger.info(`Scheduler started with cron pattern: "${cronExpression}"`);
    console.log(`⏱️ Backup scheduler active. Cron: "${cronExpression}". Press Ctrl+C to stop.`);

    return cron.schedule(cronExpression, async () => {
      logger.info('Scheduled backup job triggered');
      try {
        await taskFunction();
      } catch (err) {
        logger.error('Scheduled backup job failed', { error: err.message });
      }
    });
  }
}
