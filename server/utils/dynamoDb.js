const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-2",
});

const dynamoDb = DynamoDBDocumentClient.from(client);

const getAllItemsFromDynamoDb = async (tableName) => {
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

const getItemFromDynamoDb = async (tableName, key) => {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  try {
    const { Item } = await dynamoDb.send(command);
    return Item;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
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
    const command = new TransactWriteCommand(params);
    const response = await dynamoDb.send(command);

    return response;
  } catch (error) {
    console.error("Transaction error:", error.message);
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
