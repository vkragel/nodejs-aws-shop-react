const { getProductById } = require("../../../handlers");

test("getProductById should return product and 200 status", async () => {
  const productId = "7567ec4b-b10c-48c5-9345-fc73c48a80aa";
  const event = { pathParameters: { productId } };
  const response = await getProductById(event);

  expect(response.statusCode).toBe(200);
  expect(response.headers["Content-Type"]).toBe("application/json");

  const product = JSON.parse(response.body);
  expect(product.id).toBe(productId);
});

test("getProductById should return 404", async () => {
  const productId = "non-existed-id";
  const event = { pathParameters: { productId } };
  const response = await getProductById(event);

  expect(response.statusCode).toBe(404);

  const body = JSON.parse(response.body);
  expect(body.message).toBe("Product not found");
});
