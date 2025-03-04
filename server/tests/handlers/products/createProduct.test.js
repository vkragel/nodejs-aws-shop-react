const { createProduct } = require("../../../handlers/products");
const { createProductWithStock } = require("../../../services/productService");

jest.mock("../../../services/productService", () => ({
  createProductWithStock: jest.fn(),
}));

describe("createProduct handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 if body is empty", async () => {
    const event = {};

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Invalid request body");
  });

  test("should return status code 400 if body is not parsed", async () => {
    const event = { body: "{ title: 'Product', price: 20, count: 10 }" };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Invalid JSON format");
  });

  test("should return status code 400 if title is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "",
        description: "Test Description",
        price: 20,
        count: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe(
      "Title is required and must be a non-empty string"
    );
  });

  test("should return status code 400 if price is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        description: "Test Description",
        price: null,
        count: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe(
      "Price is required and must be a positive number"
    );
  });

  test("should return status code 400 if description is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        description: null,
        price: 20,
        count: 20,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe(
      "Description is required and must be a non-empty string"
    );
  });

  test("should return status code 400 if count is empty", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
        description: "Test Description",
        count: null,
      }),
    };

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe(
      "Count is required and must be a positive number"
    );
  });

  test("should return status code 201 if product is valid", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
        count: 20,
        description: "Test Description",
      }),
    };
    createProductWithStock.mockResolvedValue(null);

    const response = await createProduct(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);
    expect(body.title).toBe("Test Title");
    expect(body.price).toBe(20);
    expect(body.count).toBe(20);
  });

  test("should return status code 500 and error", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Title",
        price: 20,
        count: 20,
        description: "Test Description",
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
