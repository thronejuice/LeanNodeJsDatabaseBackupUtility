import path from 'path';

export class GcsStorage {
  static async upload(sourceFilePath, bucketName, destinationFileName) {
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const dest = destinationFileName || path.basename(sourceFilePath);
      await storage.bucket(bucketName).upload(sourceFilePath, {
        destination: dest,
      });
      return `gs://${bucketName}/${dest}`;
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        throw new Error('@google-cloud/storage is not installed. Please install it to use GCS storage.');
      }
      throw err;
    }
  }
}
