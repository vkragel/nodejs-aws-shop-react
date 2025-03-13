const { validateCatalogItems } = require("../../utils/productValidation");
const logger = require("../../utils/logger");
const {
  createProductWithStock,
  buildProduct,
} = require("../../services/productService");
const { createResponse } = require("../../utils/responseBuilder");
const { publishMessageToSNS } = require("../../utils/sns");

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
    const products = validItems.map((item) => {
      const { product, stock } = buildProduct(item);
      return { product, stock };
    });

    await Promise.all(
      products.map(async ({ product, stock }) => {
        logger.info("Creating product and stock", { product, stock });

        await createProductWithStock(product, stock);

        await publishMessageToSNS(product);
      })
    );

    logger.info(`Successfully processed ${products.length} valid items.`, {
      products,
    });

    return createResponse(201, {
      message: "Successfully processed catalog batch",
      processed: products,
      invalid: invalidItems,
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
