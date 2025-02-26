const { getProductsList } = require("./products/getProductsList");
const { getProductById } = require("./products/getProductById");
const { createProduct } = require("./products/createProduct");

module.exports = {
  getProductsList,
  getProductById,
  createProduct,
};
