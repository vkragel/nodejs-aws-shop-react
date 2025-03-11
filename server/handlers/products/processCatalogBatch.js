const { validateCatalogItems } = require("../../utils/productValidation");
const logger = require("../../utils/logger");
const {
  createProductWithStock,
  buildProduct,
} = require("../../services/productService");

exports.processCatalogBatch = async (event) => {
  logger.info("Received request to process catalog batch", { event });

  if (!event?.Records?.length) {
    logger.warn("Empty Records array in the event");

    return createResponse(400, { message: "Empty Records array" });
  }

  const messages = event.Records.map((record) => {
    try {
      return JSON.parse(record.body);
    } catch (error) {
      logger.warn("Failed to parse SQS message", {
        body: record.body,
        error: error.message,
      });
      return null;
    }
  }).filter(Boolean);

  logger.info("Parsed messages", messages);

  const { validItems, invalidItems } = validateCatalogItems(messages);

  if (invalidItems.length > 0) {
    logger.warn("Invalid catalog items found", { invalidItems });
  }

  if (validItems.length === 0) {
    logger.warn("No valid items found in the request", { messages });

    return createResponse(400, {
      message: "No valid items found in the request",
    });
  }

  try {
    await Promise.all(
      validItems.map((item) => {
        const { product, stock } = buildProduct(item);

        logger.info("Creating product and stock", { product, stock });

        return createProductWithStock(product, stock);
      })
    );

    logger.info(`Successfully processed ${validItems.length} valid items.`, {
      validItems,
    });
  } catch (error) {
    logger.error("Error occurred while processing catalog batch", {
      error: error.message,
      stack: error.stack,
      messages,
      validItems,
      invalidItems,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
