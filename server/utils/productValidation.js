const { z } = require("zod");

const productSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),

  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(10000, "Price must be less than 10000")
    .transform((val) => Number(val.toFixed(2))),

  count: z
    .number()
    .int("Count must be an integer")
    .min(0, "Count cannot be negative")
    .default(0),
});

const validateCatalogItems = (items) => {
  const validItems = [];
  const invalidItems = [];

  items.forEach((item, index) => {
    const validationResult = productSchema.safeParse(item);
    if (!validationResult.success) {
      invalidItems.push({
        index,
        item,
        errors: validationResult.error.format(),
      });
    } else {
      validItems.push(item);
    }
  });

  return { validItems, invalidItems };
};

module.exports = {
  productSchema,
  validateCatalogItems,
};
