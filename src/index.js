import fs from 'fs';
import path from 'path';
import { AdapterFactory } from './adapters/AdapterFactory.js';
import { Compressor } from './compression/Compressor.js';
import { StorageFactory } from './storage/StorageFactory.js';
import { logger } from './utils/Logger.js';
import { SlackNotifier } from './utils/SlackNotifier.js';

export async function testConnection(options) {
  const adapter = AdapterFactory.getAdapter(options.type, options);
  logger.info(`Testing connection for DBMS: ${options.type}`, { host: options.host, db: options.database });
  
  try {
    await adapter.testConnection();
    logger.info(`✅ Connection test successful for ${options.type}!`);
    console.log(`✅ Connection test successful for DBMS "${options.type}" (${options.database || options.db || 'connected'})!`);
    return true;
  } catch (err) {
    logger.error(`❌ Connection test failed for ${options.type}`, { error: err.message });
    console.error(`❌ Connection test failed: ${err.message}`);
    throw err;
  }
}

export async function runBackup(options) {
  const startTime = Date.now();
  const dbType = options.type;
  const dbName = options.database || options.db || 'unknown_db';
  const adapter = AdapterFactory.getAdapter(dbType, options);

  logger.info(`Starting backup for ${dbType}...`, { dbName, options });

  try {
    // 1. Connection check
    await adapter.testConnection();

    // 2. Perform raw backup export
    const rawBackupPath = await adapter.backup(options);

    // 3. Compress if requested
    const format = options.compress || 'gzip';
    let finalFilePath = rawBackupPath;
    if (format !== 'none') {
      const compressedPath = `${rawBackupPath}.${format === 'gzip' ? 'gz' : format}`;
      finalFilePath = await Compressor.compressFile(rawBackupPath, compressedPath, format);
      if (fs.existsSync(rawBackupPath) && rawBackupPath !== finalFilePath) {
        fs.unlinkSync(rawBackupPath);
      }
    }

    // 4. Store locally / cloud
    const storedLocations = await StorageFactory.handleStorage(finalFilePath, options);

    const stats = fs.statSync(finalFilePath);
    const durationMs = Date.now() - startTime;

    logger.info(`Backup operation completed successfully`, {
      dbType,
      dbName,
      durationMs,
      fileSize: stats.size,
      storedLocations
    });

    console.log(`\n🎉 Backup Completed Successfully!`);
    console.log(`⏱️ Duration: ${(durationMs / 1000).toFixed(2)}s`);
    console.log(`📦 File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`📁 Stored At:`);
    storedLocations.forEach(loc => console.log(`  - [${loc.type.toUpperCase()}] ${loc.path}`));

    // 5. Send Slack notification if webhook provided
    if (options.slackWebhook) {
      await SlackNotifier.sendNotification(options.slackWebhook, {
        status: 'SUCCESS',
        dbType,
        dbName,
        durationMs,
        fileSize: stats.size,
        action: 'Backup'
      });
    }

    return { status: 'SUCCESS', storedLocations, durationMs, fileSize: stats.size };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    logger.error(`Backup operation failed`, { dbType, dbName, error: err.message });
    console.error(`\n❌ Backup Failed: ${err.message}`);

    if (options.slackWebhook) {
      await SlackNotifier.sendNotification(options.slackWebhook, {
        status: 'FAILED',
        dbType,
        dbName,
        durationMs,
        error: err.message,
        action: 'Backup'
      });
    }
    throw err;
  }
}

export async function runRestore(options) {
  const startTime = Date.now();
  const dbType = options.type;
  const dbName = options.database || options.db || 'unknown_db';
  const adapter = AdapterFactory.getAdapter(dbType, options);

  logger.info(`Starting restore operation for ${dbType}...`, { dbName, file: options.file });

  try {
    let sourceFile = options.file;
    if (!sourceFile || !fs.existsSync(sourceFile)) {
      throw new Error(`Restore file not found: ${sourceFile}`);
    }

    // Decompress if compressed
    let decompressedFile = sourceFile;
    if (sourceFile.endsWith('.gz')) {
      const tempDir = options.tempDir || './tmp';
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      decompressedFile = path.join(tempDir, `restore_decompressed_${path.basename(sourceFile, '.gz')}`);
      await Compressor.decompressFile(sourceFile, decompressedFile);
    }

    // Restore via adapter
    await adapter.restore({ ...options, file: decompressedFile });

    if (decompressedFile !== sourceFile && fs.existsSync(decompressedFile)) {
      fs.unlinkSync(decompressedFile);
    }

    const durationMs = Date.now() - startTime;
    logger.info(`Restore operation completed successfully`, { dbType, dbName, durationMs });

    console.log(`\n🎉 Restore Completed Successfully!`);
    console.log(`⏱️ Duration: ${(durationMs / 1000).toFixed(2)}s`);

    if (options.slackWebhook) {
      await SlackNotifier.sendNotification(options.slackWebhook, {
        status: 'SUCCESS',
        dbType,
        dbName,
        durationMs,
        action: 'Restore'
      });
    }

    return { status: 'SUCCESS', durationMs };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    logger.error(`Restore operation failed`, { dbType, dbName, error: err.message });
    console.error(`\n❌ Restore Failed: ${err.message}`);

    if (options.slackWebhook) {
      await SlackNotifier.sendNotification(options.slackWebhook, {
        status: 'FAILED',
        dbType,
        dbName,
        durationMs,
        error: err.message,
        action: 'Restore'
      });
    }
    throw err;
  }
}
