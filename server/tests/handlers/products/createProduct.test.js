const { createProduct } = require("../../../handlers");
const { createProductWithStock } = require("../../../services/productService");
const { createResponse } = require("../../../utils/responseBuilder");

jest.mock("../../../services/productService", () => ({
  createProductWithStock: jest.fn(),
}));

describe("createProduct handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 if body is empty", async () => {
    const event = { body: JSON.stringify({}) };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Missing required fields");
  });

  test("should return status code 400 if title is empty", async () => {
    const event = {
      body: JSON.stringify({
        price: 20,
        count: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Missing required fields");
  });

  test("should return status code 400 if price is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        count: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Missing required fields");
  });

  test("should return status code 400 if count is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Missing required fields");
  });

  test("should return status code 201 if product is valid", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
        count: 20,
      }),
    };
    createProductWithStock.mockResolvedValue(null);

    const response = await createProduct(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Product and stock created successfully");
  });

  test("should return status code 500 and error", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
        count: 20,
      }),
    };
    createProductWithStock.mockRejectedValue(new Error("Database error"));

    const response = await createProduct(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe(
      "Internal Server Error. Failed to create product and stock"
    );
  });
});
