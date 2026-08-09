import { MongoClient } from 'mongodb';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { BaseAdapter } from './BaseAdapter.js';

const execAsync = promisify(exec);

export class MongoAdapter extends BaseAdapter {
  getConnectionUri() {
    if (this.config.uri) return this.config.uri;
    const host = this.config.host || '127.0.0.1';
    const port = Number(this.config.port) || 27017;
    const user = this.config.user;
    const pass = this.config.password;
    const db = this.config.database || 'test';

    if (user && pass) {
      return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}?authSource=admin`;
    }
    return `mongodb://${host}:${port}/${db}`;
  }

  async testConnection() {
    const uri = this.getConnectionUri();
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
    return true;
  }

  async backup(options = {}) {
    const uri = this.getConnectionUri();
    const dbName = this.config.database || 'test';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDir = options.tempDir || './tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const outputFile = path.join(tempDir, `mongo_${dbName}_${timestamp}.json`);

    try {
      // Try mongodump CLI
      const dumpDir = path.join(tempDir, `dump_${timestamp}`);
      let cmd = `mongodump --uri="${uri}" --out="${dumpDir}"`;
      if (options.collections) {
        const col = options.collections.split(',')[0].trim();
        cmd += ` --collection=${col}`;
      }
      await execAsync(cmd);

      // Save as JSON bundle / directory reference
      fs.writeFileSync(outputFile, JSON.stringify({ type: 'mongodump', path: dumpDir }), 'utf8');
      return outputFile;
    } catch (err) {
      // Driver fallback
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(dbName);

      let collectionsToExport = [];
      if (options.collections) {
        collectionsToExport = options.collections.split(',').map(c => c.trim());
      } else {
        const cols = await db.listCollections().toArray();
        collectionsToExport = cols.map(c => c.name);
      }

      const dumpData = {};
      for (const colName of collectionsToExport) {
        const docs = await db.collection(colName).find({}).toArray();
        dumpData[colName] = docs;
      }

      await client.close();
      fs.writeFileSync(outputFile, JSON.stringify(dumpData, null, 2), 'utf8');
      return outputFile;
    }
  }

  async restore(options = {}) {
    const uri = this.getConnectionUri();
    const file = options.file;

    if (!file || !fs.existsSync(file)) {
      throw new Error(`Restore file not found: ${file}`);
    }

    const content = fs.readFileSync(file, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON restore file for MongoDB: ${file}`);
    }

    if (parsed.type === 'mongodump' && parsed.path) {
      let cmd = `mongorestore --uri="${uri}" "${parsed.path}"`;
      await execAsync(cmd);
      return true;
    }

    // Driver JSON import fallback
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(this.config.database);

    for (const [colName, docs] of Object.entries(parsed)) {
      if (Array.isArray(docs) && docs.length > 0) {
        if (options.collections) {
          const targetCols = options.collections.split(',').map(c => c.trim());
          if (!targetCols.includes(colName)) continue;
        }
        await db.collection(colName).deleteMany({});
        await db.collection(colName).insertMany(docs);
      }
    }

    await client.close();
    return true;
  }
}
