const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const logger = require("./logger");

const aws_region = process.env.AWS_REGION;
const topic_arn = process.env.CREATE_PRODUCT_TOPIC_ARN;

const snsClient = new SNSClient({ region: aws_region });

const publishMessageToSNS = async (product) => {
  if (!product) {
    throw new Error("Product is required");
  }

  logger.info("Starting publishing message", { product });

  const command = new PublishCommand({
    TopicArn: topic_arn,
    Message: JSON.stringify(product),
    Subject: `New Product Created: ${product.title}`,
    MessageAttributes: {
      price: {
        DataType: "Number",
        StringValue: product.price.toString(),
      },
    },
  });

  logger.info(`PublishCommand created: ${JSON.stringify(command)}`);

  try {
    await snsClient.send(command);

    logger.info("Message successfully published to SNS", { product });
  } catch (error) {
    logger.error("Failed to publish message to SNS", {
      error: error.message,
      stack: error.stack,
      topic_arn,
      product,
    });

    throw new Error("Failed to publish message to SNS");
  }
};

module.exports = {
  snsClient,
  publishMessageToSNS,
};
