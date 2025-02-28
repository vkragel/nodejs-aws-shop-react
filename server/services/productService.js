const {
  getAllItemsFromDynamoDb,
  getItemFromDynamoDb,
} = require("../utils/dynamoDb");
const {
  generateTransaction,
  transactWrite,
} = require("../utils/dynamoDb");

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE;

const getAllProductsWithStock = async () => {
  const products = await getAllItemsFromDynamoDb(PRODUCTS_TABLE_NAME);
  const stocks = await getAllItemsFromDynamoDb(STOCKS_TABLE_NAME);

  const stockMap = stocks.reduce((acc, stock) => {
    acc[stock.product_id] = stock?.count || 0;
    return acc;
  }, {});

  return products.map((product) => ({
    ...product,
    count: stockMap[product.id],
  }));
};

const getProductByIdWithCount = async (productId) => {
  try {
    const product = await getItemFromDynamoDb(PRODUCTS_TABLE_NAME, {
      id: productId,
    });

    if (!product) return null;

    const stock = await getItemFromDynamoDb(STOCKS_TABLE_NAME, {
      product_id: productId,
    });

    return {
      ...product,
      count: stock?.count || 0,
    };
  } catch (error) {
    console.error(
      `Error fetching product with stock (ID: ${productId}):`,
      error
    );
    throw new Error(`Failed to fetch product with stock`);
  }
};

const createProductWithStock = async (product, stock) => {
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

  await transactWrite(transactionParams);
};

module.exports = {
  getAllProductsWithStock,
  getProductByIdWithCount,
  createProductWithStock,
};
