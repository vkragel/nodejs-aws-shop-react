const logger = require("../../utils/logger");
const { parseToken, decodeToken } = require("../../utils/token");
const { generatePolicy } = require("../../utils/policy");

exports.basicAuthorizer = async (event) => {
  logger.info("Received request for authorization", { event });

  const authorizationToken = event.authorizationToken;

  if (!authorizationToken) {
    logger.warn("Unauthorized: No authorization token provided");

    return generatePolicy("user", "Deny", event.methodArn);
  }

  const tokenData = parseToken(authorizationToken);

  if (!tokenData || tokenData.type !== "Basic") {
    logger.warn("Forbidden: Invalid token format", {
      authorizationToken,
      tokenData,
    });

    return generatePolicy("user", "Deny", event.methodArn);
  }

  const decodedCredentials = decodeToken(tokenData.encodedCredentials);

  if (!decodedCredentials) {
    logger.warn("Forbidden: Failed to decode token", {
      authorizationToken,
      tokenData,
    });

    return generatePolicy(decodedCredentials.login, "Deny", event.methodArn);
  }

  const expectedPassword = process.env[decodedCredentials.login];

  if (!expectedPassword || expectedPassword !== decodedCredentials.password) {
    logger.warn("Forbidden: Invalid credentials", {
      login: decodedCredentials.login,
    });

    return generatePolicy(decodedCredentials.login, "Deny", event.methodArn);
  }

  logger.info("Authorization successful", {
    login: decodedCredentials.login,
  });

  return generatePolicy(decodedCredentials.login, "Allow", event.methodArn);
};
