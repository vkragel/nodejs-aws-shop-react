const {
  createProductWithStock,
  buildProduct,
} = require("../../services/productService");
const { createResponse } = require("../../utils/responseBuilder");
const logger = require("../../utils/logger");
const { productSchema } = require("../../utils/productValidation");

exports.createProduct = async (event) => {
  logger.info("Received request to create a product", { event });

  if (!event?.body || typeof event.body !== "string") {
    logger.warn("Invalid request body", { eventBody: event?.body });

    return createResponse(400, { message: "Invalid request body" });
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    logger.warn("Invalid JSON format in request body", {
      eventBody: event.body,
      error: error.message,
    });

    return createResponse(400, { message: "Invalid JSON format" });
  }

  logger.info("Parsed request body", parsedBody);

  const result = productSchema.safeParse(parsedBody);

  if (!result.success) {
    logger.warn("Validation error", { errors: result.error.format() });

    return createResponse(400, {
      message: "Validation error",
      errors: result.error.format(),
    });
  }

  const { product, stock } = buildProduct(result.data);

  try {
    logger.info("Creating product and stock", { product, stock });

    await createProductWithStock(product, stock);

    const productWithStock = { ...product, count: stock.count };

    logger.info("Successfully created product and stock", { productWithStock });

    return createResponse(201, productWithStock);
  } catch (error) {
    logger.error("Error creating product and stock", {
      error: error.message,
      stack: error.stack,
      product,
      stock,
    });

    return createResponse(500, {
      message: "Internal Server Error. Failed to create product and stock",
    });
  }
};
