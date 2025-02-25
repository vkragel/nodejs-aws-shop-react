const { v4 } = require("uuid");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../services/dynamoDbClient");

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

async function seed() {
  try {
    for (let product of products) {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
        },
      });

      await dynamoDb.send(command);
      console.log(`Product "${product.title}" seeded successfully`);
    }

    console.log("All products seeded successfully");
  } catch (err) {
    console.log("Error seeding products: ", err);
  }
}

module.exports = seed;
