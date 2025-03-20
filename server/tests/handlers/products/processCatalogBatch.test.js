const { processCatalogBatch } = require("../../../handlers/products");
const { createProductWithStock } = require("../../../services/productService");

jest.mock("../../../services/productService", () => ({
  ...jest.requireActual("../../../services/productService"),
  createProductWithStock: jest.fn(),
}));

describe("processCatalogBatch handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 if records array is empty", async () => {
    const event = {};

    const response = await processCatalogBatch(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Empty Records array");
  });

  test("should return status code 400 if there is no valid items", async () => {
    const event = {
      Records: [{ body: "{ title: 'Product', price: 20, count: 10 }" }],
    };

    const response = await processCatalogBatch(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("No valid items found in the request");
  });

  test("should return status code 201 with valid items", async () => {
    const testProduct1 = {
      title: "Test Title 1",
      price: 11,
      count: 12,
      description: "Test Description 1",
    };
    const testProduct2 = {
      title: "Test Title 2",
      price: 21,
      count: 22,
      description: "Test Description 2",
    };

    const event = {
      Records: [
        { body: JSON.stringify(testProduct1) },
        { body: JSON.stringify(testProduct2) },
      ],
    };
    createProductWithStock.mockResolvedValue(null);

    const response = await processCatalogBatch(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(event.Records.length);

    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Successfully processed catalog batch");
    expect(body.processed.length).toBe(2);
    expect(body.invalid.length).toBe(0);
  });

  test("should return status code 201 with valid and invalid items", async () => {
    const testProduct1 = {
      title: "Test Title 1",
      price: 11,
      count: 12,
      description: "Test Description 1",
    };
    const testProduct2 = {
      title: "Test Title 2",
      price: 21,
      count: 22,
      description: "Test Description 2",
    };
    const invalidProduct = { title: "", price: -1, count: -1, description: "" };

    const event = {
      Records: [
        { body: JSON.stringify(invalidProduct) },
        { body: JSON.stringify(testProduct1) },
        { body: JSON.stringify(testProduct2) },
      ],
    };
    createProductWithStock.mockResolvedValue(null);

    const response = await processCatalogBatch(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(2);

    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Successfully processed catalog batch");
    expect(body.processed.length).toBe(2);
    expect(body.invalid.length).toBe(1);
  });

  test("should return status code 500 if something went wrong", async () => {
    const testProduct1 = {
      title: "Test Title 1",
      price: 11,
      count: 12,
      description: "Test Description 1",
    };
    const event = {
      Records: [{ body: JSON.stringify(testProduct1) }],
    };
    createProductWithStock.mockRejectedValue(new Error("Database error"));

    const response = await processCatalogBatch(event);

    expect(createProductWithStock).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Internal Server Error");
  });
});
