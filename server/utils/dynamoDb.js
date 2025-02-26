import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
});

const dynamoDb = DynamoDBDocumentClient.from(client);

export { dynamoDb };
