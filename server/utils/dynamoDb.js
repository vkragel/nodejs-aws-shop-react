const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
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

module.exports = { dynamoDb, getAllItemsFromDynamoDb, getItemFromDynamoDb };
