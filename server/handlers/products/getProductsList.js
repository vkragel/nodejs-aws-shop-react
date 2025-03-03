const { createResponse } = require("../../utils/responseBuilder");
const { getAllProductsWithStock } = require("../../services/productService");
const logger = require("../../utils/logger");

exports.getProductsList = async () => {
  try {
    logger.info("Fetching products with stock");

    const productsWithStock = await getAllProductsWithStock();

    logger.info("Successfully fetched products with stock", {
      productsCount: productsWithStock.length,
    });

    return createResponse(200, productsWithStock);
  } catch (error) {
    logger.error("Error fetching products", {
      error: error.message,
      stack: error.stack,
    });

    return createResponse(500, { message: "Internal Server Error" });
  }
};
