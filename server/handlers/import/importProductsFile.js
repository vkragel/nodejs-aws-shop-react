const { createResponse } = require("../../utils/responseBuilder");
const logger = require("../../utils/logger");
const { generateSignedUrl } = require("../../services/importService");

exports.importProductsFile = async (event) => {
  logger.info("Received request to import products file", { event });

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    logger.warn("Missing 'name' query parameter");

    return createResponse(400, { message: "Missing 'name' query parameter" });
  }

  if (typeof fileName !== "string") {
    logger.warn(`Invalid file name format: ${fileName}`);

    return createResponse(400, { message: "Invalid file name format" });
  }

  if (!fileName.toLowerCase().endsWith(".csv")) {
    logger.warn(`Invalid file format: ${fileName}`);

    return createResponse(400, { message: "Only .csv files are allowed" });
  }

  try {
    const signedUrl = await generateSignedUrl(fileName);

    return createResponse(200, signedUrl);
  } catch (error) {
    logger.error("Error generating signed URL", {
      error: error.message,
      stack: error.stack,
      fileName,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
