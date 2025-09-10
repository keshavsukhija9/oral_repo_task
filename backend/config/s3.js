const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

const uploadPDFToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: 'application/pdf',
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 PDF upload error:', error);
    throw error;
  }
};

module.exports = { uploadToS3, uploadPDFToS3 };