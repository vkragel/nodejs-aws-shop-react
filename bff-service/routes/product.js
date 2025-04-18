import fp from "fastify-plugin";
import NodeCache from "node-cache";
import { getCachedData, setCacheData } from "../utils/cache.js";
import { proxyRequest } from "../utils/proxy.js";

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
    const cachedResult = getCachedData(productCache, "products");

    if (cachedResult.hit) {
      fastify.log.info("Returning cached products list");
      return reply.code(200).send(cachedResult.data);
    }

    const strippedPath = req.url.replace(/^\/api/, "");
    const targetUrl = `${upstream}${strippedPath}`;

    const proxyResponse = await proxyRequest(targetUrl, req, reply);

    if (proxyResponse.statusCode === 200) {
      setCacheData(productCache, "products", proxyResponse.body);
    }

    return proxyResponse;
  });
});
