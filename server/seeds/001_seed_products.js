const { v4 } = require("uuid");
const {
  DynamoDBClient,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });

const TABLE_NAME = "products";

const products = [
  {
    id: v4(),
    title: "Fly Away",
    price: 24,
    description: "Author: Kristin Hannah",
  },
  {
    id: v4(),
    title: "Last Call",
    price: 15,
    description: "Author: Elon Green",
  },
  {
    id: v4(),
    title: "Arcadia",
    price: 23,
    description: "Author: Lauren Groff",
  },
  {
    id: v4(),
    title: "Never Caught",
    price: 15,
    description: "Author: Erica Armstrong Dunbar",
  },
  {
    id: v4(),
    title: "On Tennis",
    price: 23,
    description: "Author: David Foster Wallace",
  },
  {
    id: v4(),
    title: "Cold as Hell",
    price: 15,
    description: "Author: Kelly Armstrong",
  },
];

const putRequests = products.map((product) => ({
  PutRequest: {
    Item: {
      id: { S: product.id },
      title: { S: product.title },
      description: { S: product.description },
      price: { N: product.price.toString() },
    },
  },
}));

async function seed() {
  try {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: putRequests,
      },
    });

    await client.send(command);
    console.log("Products seeded successfully");
  } catch (err) {
    console.log("Error seeding products: ", err);
  }
}

module.exports = seed;
