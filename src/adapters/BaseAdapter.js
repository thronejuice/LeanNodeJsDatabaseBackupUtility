export class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  async testConnection() {
    throw new Error('testConnection() method must be implemented by subclass.');
  }

  async backup(options) {
    throw new Error('backup() method must be implemented by subclass.');
  }

  async restore(options) {
    throw new Error('restore() method must be implemented by subclass.');
  }
}
