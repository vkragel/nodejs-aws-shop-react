const {
  getAllItemsFromDynamoDb,
  getItemFromDynamoDb,
  generateTransaction,
  transactWrite,
} = require("../utils/dynamoDb");
const logger = require("../utils/logger");

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE;

const getAllProductsWithStock = async () => {
  try {
    logger.info("Fetching products from DynamoDB");

    const products = await getAllItemsFromDynamoDb(PRODUCTS_TABLE_NAME);

    logger.info("Fetching stocks from DynamoDB");

    const stocks = await getAllItemsFromDynamoDb(STOCKS_TABLE_NAME);

    logger.info("Successfully fetched and combined products with stock", {
      productsCount: products.length,
      stocksCount: stocks.length,
    });

    const stockMap = stocks.reduce((acc, stock) => {
      acc[stock.product_id] = stock?.count || 0;
      return acc;
    }, {});

    return products.map((product) => ({
      ...product,
      count: stockMap[product.id],
    }));
  } catch (error) {
    logger.error("Error fetching products or stocks", {
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

const getProductByIdWithCount = async (productId) => {
  logger.info("Fetching product and stock data", { productId });

  try {
    logger.info("Fetching product from DynamoDB", {
      tableName: PRODUCTS_TABLE_NAME,
      productId,
    });

    const product = await getItemFromDynamoDb(PRODUCTS_TABLE_NAME, {
      id: productId,
    });

    if (!product) {
      logger.warn("Product not found in DynamoDB", { productId });

      return null;
    }

    logger.info("Fetching stock data from DynamoDB", {
      tableName: STOCKS_TABLE_NAME,
      productId,
    });

    const stock = await getItemFromDynamoDb(STOCKS_TABLE_NAME, {
      product_id: productId,
    });

    const productWithStock = { ...product, count: stock?.count || 0 };

    logger.info("Successfully fetched product with stock", {
      productId,
      productWithStock,
    });

    return productWithStock;
  } catch (error) {
    logger.error("Error fetching product with stock", {
      error: error.message,
      stack: error.stack,
      productId,
    });

    throw new Error(`Failed to fetch product with stock`);
  }
};

const createProductWithStock = async (product, stock) => {
  logger.info("Starting product and stock creation", { product, stock });

  const operations = [
    {
      Action: "Put",
      TableName: PRODUCTS_TABLE_NAME,
      Item: product,
    },
    {
      Action: "Put",
      TableName: STOCKS_TABLE_NAME,
      Item: stock,
    },
  ];

  const transactionParams = generateTransaction(operations);

  try {
    logger.info("Executing DynamoDB transaction", { transactionParams });

    await transactWrite(transactionParams);

    logger.info("Successfully created product and stock");
  } catch (error) {
    logger.error("Error occurred during product and stock creation", {
      error: error.message,
      stack: error.stack,
      transactionParams,
    });

    throw new Error("Failed to create product and stock");
  }
};

module.exports = {
  getAllProductsWithStock,
  getProductByIdWithCount,
  createProductWithStock,
};
