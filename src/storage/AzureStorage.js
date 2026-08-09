import path from 'path';

export class AzureStorage {
  static async upload(sourceFilePath, containerName, blobName, connectionString) {
    try {
      const { BlobServiceClient } = await import('@azure/storage-blob');
      const connStr = connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connStr) {
        throw new Error('Azure Storage connection string is missing.');
      }
      const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const targetBlob = blobName || path.basename(sourceFilePath);
      const blockBlobClient = containerClient.getBlockBlobClient(targetBlob);
      await blockBlobClient.uploadFile(sourceFilePath);
      return `azure://${containerName}/${targetBlob}`;
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        throw new Error('@azure/storage-blob is not installed. Please install it to use Azure Blob storage.');
      }
      throw err;
    }
  }
}
