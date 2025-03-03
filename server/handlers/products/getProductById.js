const { createResponse } = require("../../utils/responseBuilder");
const { getProductByIdWithCount } = require("../../services/productService");
const logger = require("../../utils/logger");

exports.getProductById = async (event) => {
  const { productId } = event.pathParameters;

  logger.info("Received request to get product by ID", {
    productId,
    pathParameters: event.pathParameters,
    headers: event.headers,
  });

  if (!productId) {
    logger.error("Product ID is missing");

    return createResponse(400, { message: "Product ID is required" });
  }

  try {
    logger.info("Fetching product");

    const product = await getProductByIdWithCount(productId);

    if (!product) {
      logger.warn("Product not found", { productId });

      return createResponse(404, { message: "Product not found" });
    }

    logger.info("Product found", { productId, product });

    return createResponse(200, product);
  } catch (error) {
    logger.error("Error fetching product", {
      error: error.message,
      stack: error.stack,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
