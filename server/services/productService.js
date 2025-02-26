const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../utils/dynamoDb");

const getAllItems = async (tableName) => {
  const params = { TableName: tableName };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDb.send(command);
    return data.Items || [];
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    throw new Error(`Failed to fetch data from ${tableName}`);
  }
};

const getAllProductsWithStock = async () => {
  const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
  const STOCKS_TABLE = process.env.STOCKS_TABLE;

  const products = await getAllItems(PRODUCTS_TABLE);
  const stocks = await getAllItems(STOCKS_TABLE);

  const stockMap = stocks.reduce((acc, stock) => {
    acc[stock.product_id] = stock?.count || 0;
    return acc;
  }, {});

  return products.map((product) => ({
    ...product,
    count: stockMap[product.id],
  }));
};

module.exports = { getAllProductsWithStock };
