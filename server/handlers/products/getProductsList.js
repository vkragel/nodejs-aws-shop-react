const { createResponse } = require("../../utils/responseBuilder");
const { getAllProductsWithStock } = require("../../services/productService");

exports.getProductsList = async () => {
  try {
    const productsWithStock = await getAllProductsWithStock();

    return createResponse(200, productsWithStock);
  } catch (error) {
    console.error("Error fetching products:", error);

    return createResponse(500, { message: "Internal Server Error" });
  }
};
