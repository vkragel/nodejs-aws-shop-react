const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const logger = require("../utils/logger");

const client = new DynamoDBClient({
  region: "us-east-2",
});

const dynamoDb = DynamoDBDocumentClient.from(client);

const getAllItemsFromDynamoDb = async (tableName) => {
  const params = { TableName: tableName };

  try {
    logger.info(`Scanning table ${tableName}`);

    const command = new ScanCommand(params);
    const data = await dynamoDb.send(command);

    logger.info(`Successfully fetched items from table ${tableName}`, {
      itemsCount: data.Items.length,
    });
    return data.Items || [];
  } catch (error) {
    logger.error(`Error fetching data from ${tableName}`, {
      error: error.message,
      stack: error.stack,
    });

    throw new Error(`Failed to fetch data from ${tableName}`);
  }
};

const getItemFromDynamoDb = async (tableName, key) => {
  logger.info("Fetching item from DynamoDB", { tableName, key });

  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  try {
    logger.info("Sending GetCommand to DynamoDB", { tableName, key });

    const { Item } = await dynamoDb.send(command);

    if (!Item) {
      logger.warn("Item not found in DynamoDB", { tableName, key });

      return null;
    }

    logger.info("Successfully fetched item from DynamoDB", {
      tableName,
      key,
      item: Item,
    });

    return Item;
  } catch (error) {
    logger.error("Error fetching data from DynamoDB", {
      error: error.message,
      stack: error.stack,
      tableName,
      key,
    });

    throw new Error(`Failed to fetch data from ${tableName}`);
  }
};

const generateTransaction = (operations) => {
  const transactItems = operations.map((operation) => {
    const { Action, TableName, Item } = operation;

    if (!TableName || !Action || !Item) {
      throw new Error(
        "Each operation must have TableName, Action, and either Item or Key"
      );
    }

    const transactionItem = {
      [Action]: {
        TableName,
        Item,
      },
    };

    return transactionItem;
  });

  return { TransactItems: transactItems };
};

const transactWrite = async (params) => {
  try {
    logger.info("Starting DynamoDB transaction", { params });

    const command = new TransactWriteCommand(params);
    const response = await dynamoDb.send(command);

    logger.info("Transaction executed successfully", { response });
    return response;
  } catch (error) {
    logger.error("Transaction error", {
      error: error.message,
      stack: error.stack,
      params,
    });

    throw new Error("Failed to execute transaction");
  }
};

module.exports = {
  dynamoDb,
  getAllItemsFromDynamoDb,
  getItemFromDynamoDb,
  generateTransaction,
  transactWrite,
};
