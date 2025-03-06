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

  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

  if (!key.startsWith(UPLOADED_FOLDER)) {
    logger.warn(`The file is not in '${UPLOADED_FOLDER}' folder`, {
      bucket,
      key,
    });

    return createResponse(400, {
      message: `File not in '${UPLOADED_FOLDER}' folder`,
    });
  }

  try {
    logger.info("Parsing file", { bucket, key });

    await processImportFile(bucket, key);

    logger.info("File parsed successfully", { bucket, key });

    return createResponse(200, { message: "File processed successfully" });
  } catch (error) {
    logger.error("Error occurred while processing the file", {
      error: error.message,
      stack: error.stack,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
