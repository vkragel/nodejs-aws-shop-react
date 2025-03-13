const { createProduct } = require("../../../handlers/products");
const { createProductWithStock } = require("../../../services/productService");

jest.mock("../../../services/productService", () => ({
  ...jest.requireActual("../../../services/productService"),
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

  test("should return status code 400 and handle validation errors", async () => {
    const invalidProduct = {
      title: "",
      price: -10,
      count: -5,
      description: "",
    };
    const event = { body: JSON.stringify(invalidProduct) };
    createProductWithStock.mockImplementation(() => {});

    const response = await createProduct(event);

    expect(response.statusCode).toBe(400);

    const { message, errors } = JSON.parse(response.body);
    expect(message).toBe("Validation error");

    const expectedErrors = {
      title: ["Title is required"],
      price: ["Price must be greater than 0"],
      count: ["Count cannot be negative"],
      description: ["Description is required"],
    };

    Object.entries(expectedErrors).forEach(([key, errorMessages]) => {
      expect(errors[key]._errors).toEqual(errorMessages);
    });
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
