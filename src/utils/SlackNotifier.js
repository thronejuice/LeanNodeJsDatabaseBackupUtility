import axios from 'axios';
import { logger } from './Logger.js';

export class SlackNotifier {
  static async sendNotification(webhookUrl, options) {
    if (!webhookUrl) return;

    const { status, dbType, dbName, durationMs, fileSize, error, action = 'Backup' } = options;
    const isSuccess = status === 'SUCCESS';
    const color = isSuccess ? '#36a64f' : '#ff0000';
    const title = `🗄️ Database ${action} ${isSuccess ? 'Completed Successfully' : 'Failed'}`;

    const fields = [
      { title: 'DBMS Type', value: dbType || 'N/A', short: true },
      { title: 'Database Name', value: dbName || 'N/A', short: true },
      { title: 'Action', value: action, short: true },
      { title: 'Status', value: status, short: true }
    ];

    if (durationMs !== undefined) {
      fields.push({ title: 'Duration', value: `${(durationMs / 1000).toFixed(2)}s`, short: true });
    }
    if (fileSize !== undefined) {
      fields.push({ title: 'File Size', value: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`, short: true });
    }
    if (error) {
      fields.push({ title: 'Error Detail', value: error.toString(), short: false });
    }

    const payload = {
      attachments: [
        {
          color,
          title,
          fields,
          footer: 'LeanNodeJsDatabaseBackupUtility CLI',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(webhookUrl, payload);
      logger.info('Slack notification sent successfully');
    } catch (err) {
      logger.error('Failed to send Slack notification', { error: err.message });
    }
  }
}
