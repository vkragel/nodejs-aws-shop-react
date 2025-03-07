const { parseProductsFile } = require("../../../handlers/import");
const { processImportFile } = require("../../../services/importService");

jest.mock("../../../services/importService", () => ({
  processImportFile: jest.fn(),
}));

describe("parseProductsFile handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status code 400 if records array is empty", async () => {
    const event = {};

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Empty Records array");
  });

  test("should return status code 400 if bucket is missing", async () => {
    const event = {
      Records: [{ s3: { object: { key: "some_key" } } }],
    };

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("The bucket name is undefined");
  });

  test("should return status code 400 if object key is missing", async () => {
    const event = {
      Records: [
        { s3: { bucket: { name: "bucketName" }, object: { key: "" } } },
      ],
    };

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("The object key is undefined");
  });

  test("should return status code 400 if object key is not in /uploaded folder", async () => {
    const event = {
      Records: [
        { s3: { bucket: { name: "bucketName" }, object: { key: "some_key" } } },
      ],
    };

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("File not in 'uploaded/' folder");
  });

  test("should return status code 500 if something went wrong", async () => {
    const event = {
      Records: [
        {
          s3: {
            bucket: { name: "bucketName" },
            object: { key: "uploaded/products.csv" },
          },
        },
      ],
    };

    processImportFile.mockRejectedValue(new Error("Something went wrong"));

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Internal Server Error");
  });

  test("should return status code 200 if the file was parsed", async () => {
    const event = {
      Records: [
        {
          s3: {
            bucket: { name: "bucketName" },
            object: { key: "uploaded/products.csv" },
          },
        },
      ],
    };
    processImportFile.mockResolvedValue("The file was parsed");

    const response = await parseProductsFile(event);

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.message).toBe("File processed successfully");
  });
});
