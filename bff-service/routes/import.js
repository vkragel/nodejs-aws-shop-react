import fp from "fastify-plugin";

export default fp(async function (fastify) {
  const upstream = process.env.IMPORT_SERVICE_URL;

  if (!upstream) {
    fastify.log.warn(
      "IMPORT_SERVICE_URL is not defined. All /import requests will return 502."
    );
    fastify.all("/import", async (req, reply) => {
      reply.code(502).send({ error: "Cannot process request" });
    });
    return;
  }

  fastify.all("/import", async (req, reply) => {
    try {
      const targetUrl = `${upstream}${req.url}`;
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
      reply.code(500).send({ error: "Failed to connect to import service" });
    }
  });
});
