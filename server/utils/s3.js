const {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const logger = require("./logger");

const aws_region = process.env.AWS_REGION;

const s3 = new S3Client({ region: aws_region });

const getObject = async (bucket, key) => {
  try {
    logger.info("Starting getting object", { bucket, key });

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    logger.info(`GetObjectCommand created: ${JSON.stringify(command)}`);

    const { Body } = await s3.send(command);

    if (!Body || typeof Body.pipe !== "function") {
      logger.error("Invalid S3 object body", { Body });

      throw new Error("Invalid S3 object body");
    }

    return Body;
  } catch (error) {
    logger.error(`Failed to fetch S3 Object`, {
      error: error.message,
      stack: error.stack,
      bucket,
      key,
    });

    throw new Error("Failed to fetch S3 Object");
  }
};

const moveObject = async (bucket, oldKey, newKey) => {
  try {
    logger.info("Starting moving object", { bucket, oldKey, newKey });

    const moveCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey,
    });

    logger.info(`CopyObjectCommand created: ${JSON.stringify(moveCommand)}`);

    await s3.send(moveCommand);

    logger.info(`File copied to: ${newKey}`);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey,
    });

    logger.info(
      `DeleteObjectCommand created: ${JSON.stringify(deleteCommand)}`
    );

    await s3.send(deleteCommand);

    logger.info(`File deleted from: ${oldKey}`);
  } catch (error) {
    logger.error(`Failed to move S3 Object`, {
      error: error.message,
      stack: error.stack,
      bucket,
      oldKey,
      newKey,
    });

    throw new Error("Failed to move S3 Object");
  }
};

module.exports = {
  s3,
  getObject,
  moveObject,
};
