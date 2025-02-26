const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-2",
});

const dynamoDb = DynamoDBDocumentClient.from(client);

module.exports = { dynamoDb };
