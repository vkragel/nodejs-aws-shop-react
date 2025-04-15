import fp from "fastify-plugin";

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
    try {
      const targetUrl = `${upstream}${req.url}`;

      console.log("upstream", upstream);
      console.log("targetUrl", targetUrl);

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: ["GET", "HEAD"].includes(req.method)
          ? null
          : JSON.stringify(req.body),
      });

      const responseBody = await response.text();

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      reply.code(response.status).headers(headers).send(responseBody);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: "Failed to connect to order service" });
    }
  });
});
