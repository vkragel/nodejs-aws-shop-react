import fp from "fastify-plugin";
import { proxyRequest } from "../utils/proxy.js";

export default fp(async function (fastify) {
  const upstream = process.env.CART_SERVICE_URL;

  if (!upstream) {
    fastify.log.warn(
      "CART_SERVICE_URL is not defined. All /cart requests will return 502."
    );
    fastify.all("/cart", async (req, reply) => {
      reply.code(502).send({ error: "Cannot process request" });
    });
    return;
  }

  fastify.all("/cart", async (req, reply) => {
    const targetUrl = `${upstream}${req.url}`;
    await proxyRequest(targetUrl, req, reply);
  });
});
