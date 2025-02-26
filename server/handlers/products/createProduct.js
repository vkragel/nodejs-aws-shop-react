const { createResponse } = require("../../utils/responseBuilder");
const { createProductWithStock } = require("../../services/productService");
const { randomUUID } = require("crypto");

exports.createProduct = async (event) => {
  if (!event?.body || typeof event.body !== "string") {
    return createResponse(400, { message: "Invalid request body" });
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return createResponse(400, { message: "Invalid JSON format" });
  }

  const { title, price, description = "", count } = parsedBody;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return createResponse(400, {
      message: "Title is required and must be a non-empty string",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return createResponse(400, {
      message: "Price is required and must be a positive number",
    });
  }

  if (typeof count !== "number" || count < 0) {
    return createResponse(400, {
      message: "Count is required and must be a positive number",
    });
  }

  const product_id = randomUUID();

  const product = { id: product_id, title, price, description };
  const stock = { product_id, count };

  try {
    await createProductWithStock(product, stock);

    const productWithStock = { ...product, count: stock.count };

    return createResponse(201, productWithStock);
  } catch (error) {
    console.error("Error creating product and stock:", error);

    return createResponse(500, {
      message: "Internal Server Error. Failed to create product and stock",
    });
  }
};
