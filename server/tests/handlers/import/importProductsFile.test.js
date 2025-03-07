const { importProductsFile } = require("../../../handlers/import");
const { generateSignedUrl } = require("../../../services/importService");

jest.mock("../../../services/importService", () => ({
  generateSignedUrl: jest.fn(),
}));

describe("importProductsFile handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 if file name is empty", async () => {
    const event = {};

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Missing 'name' query parameter");
  });

  test("should return status code 400 if file name doesn't have string type", async () => {
    const event = { queryStringParameters: { name: 123 } };

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Invalid file name format");
  });

  test("should return status code 400 if file is not csv", async () => {
    const event = { queryStringParameters: { name: "products.exe" } };

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Only .csv files are allowed");
  });

  test("should return status code 500 if Signed URL wasn't generated", async () => {
    const event = { queryStringParameters: { name: "products.csv" } };
    generateSignedUrl.mockRejectedValue(
      new Error("Generated signed URL is not a string")
    );

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Internal Server Error");
  });

  test("should return status code 200 and generated Signed URL", async () => {
    const event = { queryStringParameters: { name: "products.csv" } };
    generateSignedUrl.mockResolvedValue("http://some-url.com");

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(200);

    const body = response.body;
    expect(body).toBe("http://some-url.com");
  });
});
