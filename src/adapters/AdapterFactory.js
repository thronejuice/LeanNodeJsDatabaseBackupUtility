import { MysqlAdapter } from './MysqlAdapter.js';
import { PostgresAdapter } from './PostgresAdapter.js';
import { MongoAdapter } from './MongoAdapter.js';
import { SqliteAdapter } from './SqliteAdapter.js';

export class AdapterFactory {
  static getAdapter(dbType, config = {}) {
    const type = (dbType || '').toLowerCase();
    switch (type) {
      case 'mysql':
      case 'mariadb':
        return new MysqlAdapter(config);
      case 'postgres':
      case 'postgresql':
      case 'pg':
        return new PostgresAdapter(config);
      case 'mongo':
      case 'mongodb':
        return new MongoAdapter(config);
      case 'sqlite':
      case 'sqlite3':
        return new SqliteAdapter(config);
      default:
        throw new Error(`Unsupported database type: "${dbType}". Supported: mysql, postgres, mongodb, sqlite.`);
    }
  }
}
