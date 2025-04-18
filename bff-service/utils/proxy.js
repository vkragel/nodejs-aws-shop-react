export async function proxyRequest(targetUrl, req, reply) {
  try {
    const filteredHeaders = { ...req.headers };
    delete filteredHeaders["host"];
    delete filteredHeaders["connection"];
    delete filteredHeaders["content-length"];
    delete filteredHeaders["accept-encoding"];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: filteredHeaders,
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
    reply.code(500).send({ error: `Failed to connect to service` });
  }
}
