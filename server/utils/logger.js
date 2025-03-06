const { Logger } = require("@aws-lambda-powertools/logger");

const logger = new Logger({
	serviceName: 'product_service',
  logLevel: "INFO",
});

module.exports = logger;
