const { randomUUID } = require("crypto");
const { dynamoDb } = require("../utils/dynamoDb");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");

const products = [
  {
    id: randomUUID(),
    title: "Fly Away",
    price: 24,
    description: "Author: Kristin Hannah",
  },
  {
    id: randomUUID(),
    title: "Last Call",
    price: 15,
    description: "Author: Elon Green",
  },
  {
    id: randomUUID(),
    title: "Arcadia",
    price: 23,
    description: "Author: Lauren Groff",
  },
  {
    id: randomUUID(),
    title: "Never Caught",
    price: 15,
    description: "Author: Erica Armstrong Dunbar",
  },
  {
    id: randomUUID(),
    title: "On Tennis",
    price: 23,
    description: "Author: David Foster Wallace",
  },
  {
    id: randomUUID(),
    title: "Cold as Hell",
    price: 15,
    description: "Author: Kelly Armstrong",
  },
];

const stocks = products.map(({ id }) => ({
  product_id: id,
  count: Math.floor(Math.random() * 25),
}));

async function seed() {
  try {
    console.log("Start seeding products...");

    await Promise.all(
      products.map(async (product) => {
        const params = { TableName: "products", Item: product };

        const command = new PutCommand(params);

        await dynamoDb.send(command);
      })
    );

    console.log("Products seeded successfully");

    console.log("Start seeding stocks...");

    await Promise.all(
      stocks.map(async (stock) => {
        const params = { TableName: "stocks", Item: stock };

        const command = new PutCommand(params);

        await dynamoDb.send(command);
      })
    );

    console.log("Stocks seeded successfully");

    console.log("Data successfully loaded to DynamoDB");
  } catch (error) {
    console.error("Error seeding tables: ", error);
  }
}

module.exports = seed;
