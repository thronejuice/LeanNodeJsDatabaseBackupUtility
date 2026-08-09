import fs from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

export class Compressor {
  static async compressFile(inputFilePath, outputFilePath, format = 'gzip') {
    if (format === 'none' || !format) {
      if (inputFilePath !== outputFilePath) {
        fs.copyFileSync(inputFilePath, outputFilePath);
      }
      return outputFilePath;
    }

    const sourceStream = fs.createReadStream(inputFilePath);
    const destinationStream = fs.createWriteStream(outputFilePath);
    
    if (format === 'gzip' || format === 'gz') {
      const gzip = zlib.createGzip();
      await pipeline(sourceStream, gzip, destinationStream);
    } else {
      throw new Error(`Unsupported compression format: ${format}`);
    }

    return outputFilePath;
  }

  static async decompressFile(inputFilePath, outputFilePath) {
    if (inputFilePath.endsWith('.gz')) {
      const sourceStream = fs.createReadStream(inputFilePath);
      const destinationStream = fs.createWriteStream(outputFilePath);
      const gunzip = zlib.createGunzip();
      await pipeline(sourceStream, gunzip, destinationStream);
      return outputFilePath;
    }

    if (inputFilePath !== outputFilePath) {
      fs.copyFileSync(inputFilePath, outputFilePath);
    }
    return outputFilePath;
  }
}
