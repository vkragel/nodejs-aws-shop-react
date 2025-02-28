const { createResponse } = require("../../utils/responseBuilder");
const { createProductWithStock } = require("../../services/productService");
const { randomUUID } = require("crypto");
const logger = require("../../utils/logger");

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

  const { title, price, description, count } = parsedBody;

  logger.info("Parsed request body", { title, price, description, count });

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    logger.warn("Invalid title", { title });

    return createResponse(400, {
      message: "Title is required and must be a non-empty string",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    logger.warn("Invalid price", { price });

    return createResponse(400, {
      message: "Price is required and must be a positive number",
    });
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    logger.warn("Invalid description", { description });

    return createResponse(400, {
      message: "Description is required and must be a non-empty string",
    });
  }

  if (typeof count !== "number" || count < 0) {
    logger.warn("Invalid count", { count });

    return createResponse(400, {
      message: "Count is required and must be a positive number",
    });
  }

  const product_id = randomUUID();

  const product = { id: product_id, title, price, description };
  const stock = { product_id, count };

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
