const { v4 } = require("uuid");
const { dynamoDb } = require("../utils/dynamoDb");

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
        await dynamoDb.put(params).promise();
      })
    );
    console.log("Products seeded successfully");

    console.log("Start seeding stocks...");
    await Promise.all(
      stocks.map(async (stock) => {
        const params = { TableName: "stocks", Item: stock };
        await dynamoDb.put(params).promise();
      })
    );
    console.log("Stocks seeded successfully");

    console.log("Data successfully loaded to DynamoDB");
  } catch (error) {
    console.error("Error seeding tables: ", error);
  }
}

module.exports = seed;
