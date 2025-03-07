const { getProductsList } = require("../../../handlers/products");
const { getAllProductsWithStock } = require("../../../services/productService");

jest.mock("../../../services/productService", () => ({
  getAllProductsWithStock: jest.fn(),
}));

describe("getProductsList handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 200 and list of products", async () => {
    const mockProducts = [
      { id: "1", title: "Fly Away", price: 24, description: "D1" },
      { id: "2", title: "Last Call", price: 15, description: "D2" },
      { id: "2", title: "Arcadia", price: 23, description: "D3" },
    ];

    getAllProductsWithStock.mockResolvedValue(mockProducts);

    const response = await getProductsList();

    expect(getAllProductsWithStock).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("application/json");

    const products = JSON.parse(response.body);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test("should return status code 500 and error", async () => {
    getAllProductsWithStock.mockRejectedValue(new Error("Database error"));

    const response = await getProductsList();

    expect(getAllProductsWithStock).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Internal Server Error");
  });
});
