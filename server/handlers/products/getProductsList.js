const { products } = require("./products");
const { allowedOrigin } = require("../../config");

exports.getProductsList = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(products),
  };
};
