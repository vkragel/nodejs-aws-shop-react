import fp from "fastify-plugin";
import NodeCache from "node-cache";

const productCache = new NodeCache({ stdTTL: 120 });

export default fp(async function (fastify) {
  const upstream = process.env.PRODUCT_SERVICE_URL;

  if (!upstream) {
    fastify.log.warn(
      "PRODUCT_SERVICE_URL is not defined. All /product requests will return 502."
    );
    fastify.all("/products", async (req, reply) => {
      reply.code(502).send({ error: "Cannot process request" });
    });
    return;
  }

  fastify.all("/products", async (req, reply) => {
    try {
      const cachedData = productCache.get("products");

      if (cachedData) {
        fastify.log.info("Returning cached products list");
        return reply.code(200).send(cachedData);
      }

      const targetUrl = `${upstream}${req.url}`;

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: ["GET", "HEAD"].includes(req.method)
          ? null
          : JSON.stringify(req.body),
      });

      const responseBody = await response.text();

      productCache.set("products", responseBody);

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      reply.code(response.status).headers(headers).send(responseBody);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: "Failed to connect to product service" });
    }
  });
});
