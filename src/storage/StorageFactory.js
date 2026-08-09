import { LocalStorage } from './LocalStorage.js';
import { S3Storage } from './S3Storage.js';
import { GcsStorage } from './GcsStorage.js';
import { AzureStorage } from './AzureStorage.js';

export class StorageFactory {
  static async handleStorage(sourceFilePath, options = {}) {
    const storageType = (options.storage || 'local').toLowerCase();
    const results = [];

    // Local storage by default or explicitly
    const localDest = await LocalStorage.store(sourceFilePath, options.out || './backups');
    results.push({ type: 'local', path: localDest });

    if (storageType === 's3' || options.s3Bucket) {
      if (!options.s3Bucket) {
        throw new Error('S3 bucket name (--s3-bucket) is required for s3 storage.');
      }
      const s3Uri = await S3Storage.upload(sourceFilePath, options.s3Bucket, options.s3Key, {
        region: options.s3Region,
        accessKeyId: options.s3AccessKey,
        secretAccessKey: options.s3SecretKey
      });
      results.push({ type: 's3', path: s3Uri });
    }

    if (storageType === 'gcs' || options.gcsBucket) {
      if (!options.gcsBucket) {
        throw new Error('GCS bucket name (--gcs-bucket) is required for gcs storage.');
      }
      const gcsUri = await GcsStorage.upload(sourceFilePath, options.gcsBucket, options.gcsName);
      results.push({ type: 'gcs', path: gcsUri });
    }

    if (storageType === 'azure' || options.azureContainer) {
      if (!options.azureContainer) {
        throw new Error('Azure container name (--azure-container) is required for azure storage.');
      }
      const azureUri = await AzureStorage.upload(sourceFilePath, options.azureContainer, options.azureBlob, options.azureConnectionString);
      results.push({ type: 'azure', path: azureUri });
    }

    return results;
  }
}
