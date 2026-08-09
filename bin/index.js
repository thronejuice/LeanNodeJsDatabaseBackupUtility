#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { testConnection, runBackup, runRestore } from '../src/index.js';
import { Scheduler } from '../src/utils/Scheduler.js';

dotenv.config();

const program = new Command();

program
  .name('db-backup')
  .description('Lean CLI utility for backing up and restoring MySQL, PostgreSQL, MongoDB, and SQLite databases.')
  .version('1.0.0');

// Shared connection options
function addConnectionOptions(cmd) {
  return cmd
    .requiredOption('-t, --type <dbms>', 'Database management system type (mysql, postgres, mongodb, sqlite)')
    .option('-h, --host <host>', 'Database server host address', '127.0.0.1')
    .option('-P, --port <port>', 'Database server port number')
    .option('-u, --user <username>', 'Database user')
    .option('-p, --password <password>', 'Database user password')
    .option('-d, --database <dbname>', 'Database name or SQLite file path')
    .option('--db <dbname>', 'Alias for --database')
    .option('--uri <uri>', 'MongoDB connection URI (optional for MongoDB)')
    .option('--slack-webhook <url>', 'Slack incoming webhook URL for notifications');
}

// 1. Command: test-connection
const testCmd = program
  .command('test-connection')
  .description('Test database credentials and connectivity');

addConnectionOptions(testCmd)
  .action(async (options) => {
    try {
      options.database = options.database || options.db;
      await testConnection(options);
    } catch (err) {
      process.exit(1);
    }
  });

// 2. Command: backup
const backupCmd = program
  .command('backup')
  .description('Perform database backup operation');

addConnectionOptions(backupCmd)
  .option('-o, --out <directory>', 'Local output directory for backups', './backups')
  .option('-c, --compress <format>', 'Compression format (gzip, none)', 'gzip')
  .option('-s, --storage <type>', 'Storage type (local, s3, gcs, azure)', 'local')
  .option('--backup-type <type>', 'Backup type (full, incremental, differential)', 'full')
  .option('--tables <tables>', 'Comma-separated table names to backup (MySQL/PostgreSQL)')
  .option('--collections <collections>', 'Comma-separated collection names to backup (MongoDB)')
  .option('--s3-bucket <bucket>', 'AWS S3 Bucket name')
  .option('--s3-key <key>', 'AWS S3 Object Key prefix')
  .option('--gcs-bucket <bucket>', 'Google Cloud Storage Bucket name')
  .option('--azure-container <container>', 'Azure Blob Storage Container name')
  .option('--schedule <cron>', 'Cron expression for automated backup scheduling (e.g. "0 2 * * *")')
  .action(async (options) => {
    try {
      options.database = options.database || options.db;

      if (options.schedule) {
        Scheduler.scheduleTask(options.schedule, async () => {
          await runBackup(options);
        });
      } else {
        await runBackup(options);
      }
    } catch (err) {
      process.exit(1);
    }
  });

// 3. Command: restore
const restoreCmd = program
  .command('restore')
  .description('Perform database restore operation');

addConnectionOptions(restoreCmd)
  .requiredOption('-f, --file <filepath>', 'Path to the backup file to restore from')
  .option('--tables <tables>', 'Comma-separated table names to selectively restore')
  .option('--collections <collections>', 'Comma-separated collection names to selectively restore')
  .action(async (options) => {
    try {
      options.database = options.database || options.db;
      await runRestore(options);
    } catch (err) {
      process.exit(1);
    }
  });

program.parse(process.argv);
