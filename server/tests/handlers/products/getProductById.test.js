const { getProductById } = require("../../../handlers");
const { getProductByIdWithCount } = require("../../../services/productService");
const { createResponse } = require("../../../utils/responseBuilder");

jest.mock("../../../services/productService", () => ({
  getProductByIdWithCount: jest.fn(),
}));

describe("getProductById handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 and Product ID is required message", async () => {
    const event = { pathParameters: {} };

    const response = await getProductById(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Product ID is required");
  });

  test("should return status code 404 if product doesn't exist", async () => {
    const event = { pathParameters: { productId: "non-existed-id" } };
    getProductByIdWithCount.mockResolvedValue(null);

    const response = await getProductById(event);

    expect(getProductByIdWithCount).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(404);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Product not found");
  });

  test("should return status code 200 and product details", async () => {
    const event = { pathParameters: { productId: "1" } };
    getProductByIdWithCount.mockResolvedValue({
      id: "1",
      title: "Fly Away",
      price: 24,
      description: "D1",
    });

    const response = await getProductById(event);

    expect(getProductByIdWithCount).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.id).toBe("1");
    expect(body.title).toBe("Fly Away");
    expect(body.price).toBe(24);
    expect(body.description).toBe("D1");
  });

  test("should return status code 500 and error", async () => {
    const event = { pathParameters: { productId: "1" } };
    getProductByIdWithCount.mockRejectedValue(new Error("Database error"));

    const response = await getProductById(event);

    expect(getProductByIdWithCount).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Internal Server Error");
  });
});
