import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { AdapterFactory } from '../src/adapters/AdapterFactory.js';
import { Compressor } from '../src/compression/Compressor.js';
import { SqliteAdapter } from '../src/adapters/SqliteAdapter.js';
import { runBackup, runRestore, testConnection } from '../src/index.js';

describe('LeanNodeJsDatabaseBackupUtility Unit & Integration Tests', () => {
  const tmpDir = path.resolve('./tmp_test');
  const sampleSqlitePath = path.join(tmpDir, 'test.sqlite');
  const restoredSqlitePath = path.join(tmpDir, 'restored.sqlite');
  const backupOutDir = path.join(tmpDir, 'backups');

  before(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    // Create a dummy file for SQLite testing
    fs.writeFileSync(sampleSqlitePath, 'DUMMY SQLITE DATA CONTENT FOR TEST', 'utf8');
  });

  after(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('AdapterFactory instantiates correct adapter instance', () => {
    const sqliteAdapter = AdapterFactory.getAdapter('sqlite', { database: sampleSqlitePath });
    assert.strictEqual(sqliteAdapter instanceof SqliteAdapter, true);

    assert.throws(() => {
      AdapterFactory.getAdapter('unknown_db_type');
    }, /Unsupported database type/);
  });

  test('Compressor gzips and gunzips file correctly', async () => {
    const originalFile = path.join(tmpDir, 'source.txt');
    const compressedFile = path.join(tmpDir, 'source.txt.gz');
    const decompressedFile = path.join(tmpDir, 'source_decompressed.txt');

    fs.writeFileSync(originalFile, 'Hello World Backup Compression Test!', 'utf8');
    
    await Compressor.compressFile(originalFile, compressedFile, 'gzip');
    assert.strictEqual(fs.existsSync(compressedFile), true);

    await Compressor.decompressFile(compressedFile, decompressedFile);
    assert.strictEqual(fs.readFileSync(decompressedFile, 'utf8'), 'Hello World Backup Compression Test!');
  });

  test('SQLite Backup and Restore operation end-to-end', async () => {
    // 1. Connection test
    const connResult = await testConnection({
      type: 'sqlite',
      database: sampleSqlitePath
    });
    assert.strictEqual(connResult, true);

    // 2. Perform Backup
    const backupResult = await runBackup({
      type: 'sqlite',
      database: sampleSqlitePath,
      out: backupOutDir,
      compress: 'gzip',
      tempDir: tmpDir
    });

    assert.strictEqual(backupResult.status, 'SUCCESS');
    const backupFile = backupResult.storedLocations[0].path;
    assert.strictEqual(fs.existsSync(backupFile), true);

    // 3. Perform Restore
    const restoreResult = await runRestore({
      type: 'sqlite',
      database: restoredSqlitePath,
      file: backupFile,
      tempDir: tmpDir
    });

    assert.strictEqual(restoreResult.status, 'SUCCESS');
    assert.strictEqual(fs.existsSync(restoredSqlitePath), true);
    assert.strictEqual(fs.readFileSync(restoredSqlitePath, 'utf8'), 'DUMMY SQLITE DATA CONTENT FOR TEST');
  });
});
