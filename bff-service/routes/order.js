import fp from "fastify-plugin";
import { proxyRequest } from "../utils/proxy.js";

export default fp(async function (fastify) {
  const upstream = process.env.ORDER_SERVICE_URL;

  if (!upstream) {
    fastify.log.warn(
      "ORDER_SERVICE_URL is not defined. All /order requests will return 502."
    );
    fastify.all("/order", async (req, reply) => {
      reply.code(502).send({ error: "Cannot process request" });
    });
    return;
  }

  fastify.all("/order", async (req, reply) => {
    const strippedPath = req.url.replace(/^\/api/, "");
    const targetUrl = `${upstream}${strippedPath}`;
    await proxyRequest(targetUrl, req, reply);
  });
});
