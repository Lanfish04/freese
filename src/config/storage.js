const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.CREDENTIALS,
});

const bucketName = process.env.BUCKET_NAME; // nama bucket kamu
const bucket = storage.bucket(bucketName);

console.log(`Connected to Google Cloud Storage bucket: ${bucketName}`);

module.exports = bucket;