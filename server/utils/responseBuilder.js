const { allowedOrigin } = require("../config");

const createResponse = (statusCode, body) => {
  const responseBody = typeof body === "object" ? JSON.stringify(body) : body;

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    },
    body: responseBody,
  };
};

module.exports = { createResponse };
