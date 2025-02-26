const { createResponse } = require("../../utils/responseBuilder");
const { createProductWithStock } = require("../../services/productService");
const { randomUUID } = require("crypto");

exports.createProduct = async (event) => {
  const {
    title,
    price,
    description = "",
    count,
  } = JSON.parse(event?.body || {});

  if (!title || !price || !count) {
    return createResponse(400, { message: "Missing required fields" });
  }

  const product_id = randomUUID();

  const product = {
    id: product_id,
    title,
    price,
    description,
  };

  const stock = {
    product_id,
    count,
  };

  try {
    await createProductWithStock(product, stock);

    return createResponse(201, {
      message: "Product and stock created successfully",
    });
  } catch (error) {
    console.error("Error creating product and stock:", error);

    return createResponse(500, {
      message: "Internal Server Error. Failed to create product and stock",
    });
  }
};
