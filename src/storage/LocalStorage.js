import fs from 'fs';
import path from 'path';

export class LocalStorage {
  static async store(sourceFilePath, targetDir) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const fileName = path.basename(sourceFilePath);
    const destPath = path.join(targetDir, fileName);

    if (sourceFilePath !== destPath) {
      fs.copyFileSync(sourceFilePath, destPath);
    }
    return destPath;
  }
}
