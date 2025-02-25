const { getProductsList } = require("../../../handlers");

test("getProductsList should return list of products and 200 status", async () => {
  const response = await getProductsList();

  expect(response.statusCode).toBe(200);
  expect(response.headers["Content-Type"]).toBe("application/json");

  const products = JSON.parse(response.body);
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
});
