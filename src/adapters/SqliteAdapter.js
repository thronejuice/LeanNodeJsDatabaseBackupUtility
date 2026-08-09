import fs from 'fs';
import path from 'path';
import { BaseAdapter } from './BaseAdapter.js';

export class SqliteAdapter extends BaseAdapter {
  getDbPath() {
    const dbPath = this.config.database || this.config.db;
    if (!dbPath) {
      throw new Error('SQLite database file path (--db) is required.');
    }
    return path.resolve(dbPath);
  }

  async testConnection() {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) {
      throw new Error(`SQLite database file does not exist at: ${dbPath}`);
    }
    // Check read permission
    fs.accessSync(dbPath, fs.constants.R_OK);
    return true;
  }

  async backup(options = {}) {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) {
      throw new Error(`SQLite database file not found: ${dbPath}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbName = path.basename(dbPath, path.extname(dbPath));
    const tempDir = options.tempDir || './tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const outputFile = path.join(tempDir, `sqlite_${dbName}_${timestamp}.sqlite`);

    fs.copyFileSync(dbPath, outputFile);
    return outputFile;
  }

  async restore(options = {}) {
    const targetDbPath = this.getDbPath();
    const backupFile = options.file;

    if (!backupFile || !fs.existsSync(backupFile)) {
      throw new Error(`SQLite restore backup file not found: ${backupFile}`);
    }

    const targetDir = path.dirname(targetDbPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(backupFile, targetDbPath);
    return true;
  }
}
