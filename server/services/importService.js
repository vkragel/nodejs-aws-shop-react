const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require("../utils/logger");

const bucketName = process.env.BUCKET_NAME;
const aws_region = process.env.AWS_REGION;

const s3 = new S3Client({ region: aws_region });

const generateSignedUrl = async (fileName, expiresIn = 180) => {
  const fileKey = `uploaded/${fileName}`;

  logger.info(`Generating signed URL for file: ${fileKey}`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: "text/csv",
  });

  logger.info(`PutObjectCommand created: ${JSON.stringify(command)}`);

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn });

    if (typeof signedUrl !== "string") {
      logger.error("Generated signed URL is not a string", { signedUrl });

      throw new Error("Generated signed URL is not a string");
    }

    logger.info(`Generated signed URL: ${signedUrl}`);

    return signedUrl;
  } catch (error) {
    logger.error(`Error generating signed URL for file ${fileKey}:`, {
      error: error.message,
      stack: error.stack,
      fileName,
    });

    throw new Error("Failed to generate signed URL");
  }
};

module.exports = {
  generateSignedUrl,
};
