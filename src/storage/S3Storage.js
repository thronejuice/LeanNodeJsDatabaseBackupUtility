import fs from 'fs';
import path from 'path';

export class S3Storage {
  static async upload(sourceFilePath, bucketName, s3Key, credentials = {}) {
    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({
        region: credentials.region || process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: credentials.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      const fileStream = fs.createReadStream(sourceFilePath);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key || path.basename(sourceFilePath),
        Body: fileStream
      });
      await client.send(command);
      return `s3://${bucketName}/${s3Key || path.basename(sourceFilePath)}`;
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        throw new Error('@aws-sdk/client-s3 is not installed. Please install it to use AWS S3 storage.');
      }
      throw err;
    }
  }
}
