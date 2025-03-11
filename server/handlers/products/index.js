const { createProduct } = require("./createProduct");
const { getProductById } = require("./getProductById");
const { getProductsList } = require("./getProductsList");
const { processCatalogBatch } = require("./processCatalogBatch");

module.exports = {
  createProduct,
  getProductById,
  getProductsList,
  processCatalogBatch,
};
