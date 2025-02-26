const { allowedOrigin } = require("../config");

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET",
  },
  body: JSON.stringify(body),
});

module.exports = { createResponse };
