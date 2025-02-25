const { v4 } = require("uuid");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../services/dynamoDbClient");

const PRODUCTS_TABLE_NAME = "products";
const STOCKS_TABLE_NAME = "stocks";

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
        TableName: PRODUCTS_TABLE_NAME,
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

    await seedStocks(products);
  } catch (err) {
    console.log("Error seeding products: ", err);
  }
}

async function seedStocks(products) {
  const stocks = products.map(({ id }) => ({
    product_id: id,
    count: Math.floor(Math.random() * 25),
  }));

  try {
    for (let stock of stocks) {
      const command = new PutCommand({
        TableName: STOCKS_TABLE_NAME,
        Item: {
          product_id: stock.product_id,
          count: stock.count,
        },
      });

      await dynamoDb.send(command);
      console.log(
        `Stock for product_id "${stock.product_id}" seeded successfully`
      );
    }

    console.log("All stocks seeded successfully");
  } catch (error) {
    console.error("Error seeding stocks: ", err);
  }
}

module.exports = seed;
