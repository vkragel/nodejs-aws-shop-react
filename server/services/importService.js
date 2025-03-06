const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require("../utils/logger");
const { s3, getObject, moveObject } = require("../utils/s3");
const { pipeline } = require("stream/promises");
const csv = require("csv-parser");
const { UPLOADED_FOLDER, PARSED_FOLDER } = require("../config");

const bucketName = process.env.BUCKET_NAME;

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

  try {
    await pipeline(stream, csv({ headers: true }), async function* (source) {
      for await (const row of source) {
        if (Object.keys(row).length === 0) {
          logger.warn("Empty row detected", { rowNumber: rowCount + 1 });
          continue;
        }

        rowCount++;

        logger.info(`Parsed CSV row ${rowCount}`, {
          rowNumber: rowCount,
          columnCount: Object.keys(row).length,
          columnNames: Object.keys(row),
          data: row,
        });
      }
    });

    if (rowCount === 0) {
      logger.warn("No rows were parsed from the CSV file");
    } else {
      logger.info("CSV parsing completed successfully.", {
        totalRows: rowCount,
      });
    }
  } catch (error) {
    logger.error("Failed to parse CSV file", {
      error: error.message,
      stack: error.stack,
      rowsProcessed: rowCount,
    });

    throw new Error("Failed to parse CSV file");
  }
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
