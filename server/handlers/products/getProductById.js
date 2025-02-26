const { createResponse } = require("../../utils/responseBuilder");
const { getProductByIdWithCount } = require("../../services/productService");

exports.getProductById = async (event) => {
  const { productId } = event.pathParameters;

  if (!productId)
    return createResponse(400, { message: "Product ID is required" });

  try {
    const product = await getProductByIdWithCount(productId);

    if (!product) {
      return createResponse(404, { message: "Product not found" });
    }

    return createResponse(200, product);
  } catch (error) {
    return createResponse(500, { message: "Internal Server Error" });
  }
};
