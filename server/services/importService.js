const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require("../utils/logger");
const { s3, getObject, moveObject } = require("../utils/s3");
const csv = require("csv-parser");
const { UPLOADED_FOLDER, PARSED_FOLDER } = require("../config");
const { sendMessageToSQS } = require("../utils/sqs");

const bucketName = process.env.BUCKET_NAME;
const queueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;

const generateSignedUrl = async (fileName, expiresIn = 180) => {
  const fileKey = `${UPLOADED_FOLDER}${fileName}`;

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

const parseCsv = async (stream) => {
  logger.info("Starting CSV parsing...");

  let rowCount = 0;
  const rows = [];

  const headers = {
    title: "title",
    description: "description",
    price: "price",
    count: "count",
  };

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv({ skipLines: 1, headers: Object.keys(headers) }))
      .on("data", (row) => {
        if (Object.keys(row).length === 0) return;

        rowCount++;
        const transformedRow = {
          title: row.title,
          description: row.description,
          price: Number(row.price),
          count: Number(row.count),
        };

        rows.push(transformedRow);
      })
      .on("end", async () => {
        try {
          for (const row of rows) {
            await sendMessageToSQS(queueUrl, row);
          }

          logger.info("CSV parsing completed successfully.", {
            totalRows: rowCount,
          });

          resolve();
        } catch (error) {
          logger.error("Failed to send message to SQS", {
            error: error.message,
            totalRows: rows.length,
          });

          reject(error);
        }
      })
      .on("error", (error) => {
        logger.error("Failed to parse CSV file", {
          error: error.message,
          stack: error.stack,
          rowsProcessed: rowCount,
        });

        reject(error);
      });
  });
};

const processImportFile = async (bucket, key) => {
  logger.info("Processing file", { bucket, key });

  let fileStream;

  try {
    logger.info("Fetching S3 Object...", { bucket, key });

    fileStream = await getObject(bucket, key);
  } catch (error) {
    logger.error("Failed to load S3 Object", {
      error: error.message,
      stack: error.stack,
      bucket,
      key,
    });

    throw new Error("Failed to load S3 Object");
  }

  if (!fileStream) {
    logger.error("S3 Object not found", { bucket, key });

    throw new Error("S3 Object not found");
  }

  try {
    logger.info("Parsing CSV file", { bucket, key });

    await parseCsv(fileStream);
  } catch (error) {
    logger.error("Failed to parse CSV", {
      error: error.message,
      stack: error.stack,
      bucket,
      key,
    });

    throw new Error("Failed to parse CSV");
  }

  const newKey = key.replace(UPLOADED_FOLDER, PARSED_FOLDER);

  logger.info("New key generated", { oldKey: key, newKey });

  try {
    logger.info("Moving S3 Object", { bucket, oldKey: key, newKey });

    await moveObject(bucket, key, newKey);
  } catch (error) {
    logger.error("Failed to move S3 Object", {
      error: error.message,
      stack: error.stack,
      bucket,
      oldKey: key,
      newKey,
    });

    throw new Error("Failed to move S3 Object");
  }

  logger.info("File processing completed", { bucket, key });
};

module.exports = {
  generateSignedUrl,
  processImportFile,
};
