const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-2",
});

module.exports = { dynamoDb };
