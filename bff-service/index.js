import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";

import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import importRoutes from "./routes/import.js";
import orderRoutes from "./routes/order.js";

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

fastify.register(productRoutes);
fastify.register(cartRoutes);
fastify.register(importRoutes);
fastify.register(orderRoutes);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log("Gateway listening on port 4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
