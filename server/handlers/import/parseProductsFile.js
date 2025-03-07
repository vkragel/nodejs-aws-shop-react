const { createResponse } = require("../../utils/responseBuilder");
const logger = require("../../utils/logger");
const { processImportFile } = require("../../services/importService");
const { UPLOADED_FOLDER } = require("../../config");

exports.parseProductsFile = async (event) => {
  logger.info("Received request to parse CSV file", { event });

  if (!event?.Records?.length) {
    logger.warn("Empty Records array in the event");

    return createResponse(400, { message: "Empty Records array" });
  }

  const record = event.Records[0];
  const { bucket, object } = record?.s3 || {};

  const bucketName = bucket?.name;
  const key = object?.key
    ? decodeURIComponent(object.key.replace(/\+/g, " "))
    : null;

  if (!bucketName || !key) {
    const missingField = !bucketName ? "bucket name" : "object key";
    logger.warn(`The ${missingField} is undefined`, { record });

    return createResponse(400, { message: `The ${missingField} is undefined` });
  }

  if (!key.startsWith(UPLOADED_FOLDER)) {
    logger.warn(`The file is not in '${UPLOADED_FOLDER}' folder`, {
      bucketName,
      key,
    });

    return createResponse(400, {
      message: `File not in '${UPLOADED_FOLDER}' folder`,
    });
  }

  try {
    logger.info("Parsing file", { bucketName, key });

    await processImportFile(bucketName, key);

    logger.info("File parsed successfully", { bucketName, key });

    return createResponse(200, { message: "File processed successfully" });
  } catch (error) {
    logger.error("Error occurred while processing the file", {
      error: error.message,
      stack: error.stack,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
