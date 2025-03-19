const logger = require("../../utils/logger");
const { createResponse } = require("../../utils/responseBuilder");
const { parseToken, decodeToken } = require("../../utils/token");
const { generatePolicy } = require("../../utils/policy");

exports.basicAuthorizer = async (event) => {
  logger.info("Received request for authorization", { event });

  const authorizationToken = event.authorizationToken;

  if (!authorizationToken) {
    logger.warn("Unauthorized: No authorization token provided");

    return createResponse(401, {
      message: "Unauthorized: No authorization token provided",
    });
  }

  const tokenData = parseToken(authorizationToken);

  if (!tokenData || tokenData.type !== "Basic") {
    logger.warn("Forbidden: Invalid token format", {
      authorizationToken,
      tokenData,
    });

    return createResponse(403, {
      message: "Forbidden: Invalid token format",
    });
  }

  const decodedCredentials = decodeToken(tokenData.encodedCredentials);

  if (!decodedCredentials) {
    logger.warn("Forbidden: Failed to decode token", {
      authorizationToken,
      tokenData,
    });

    return createResponse(403, {
      message: "Forbidden: Failed to decode token",
    });
  }

  const expectedPassword = process.env[decodedCredentials.login];

  if (!expectedPassword || expectedPassword !== decodedCredentials.password) {
    logger.warn("Forbidden: Invalid credentials", {
      login: decodedCredentials.login,
    });

    return createResponse(403, {
      message: "Forbidden: Invalid credentials",
    });
  }

  logger.info("Authorization successful", {
    login: decodedCredentials.login,
  });

  return generatePolicy(decodedCredentials.login, "Allow", event.methodArn);
};
