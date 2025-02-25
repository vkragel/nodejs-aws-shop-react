const { products } = require("./products");
const { allowedOrigin } = require("../../config");

exports.getProductById = async (event) => {
  const { productId } = event.pathParameters;

  const product = products.find(({ id }) => id === productId);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(product),
  };
};
