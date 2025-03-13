const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const logger = require("./logger");

const aws_region = process.env.AWS_REGION;

const sqsClient = new SQSClient({ region: aws_region });

const sendMessageToSQS = async (queueUrl, messageBody) => {
  try {
    if (!queueUrl) {
      throw new Error("Queue URL is required");
    }

    logger.info("Starting sending message", { queueUrl, messageBody });

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    logger.info(`SendMessageCommand created: ${JSON.stringify(command)}`);

    await sqsClient.send(command);

    logger.info("Message successfully sent to SQS", { messageBody });
  } catch (error) {
    logger.error(`Failed to send message to sqs`, {
      error: error.message,
      stack: error.stack,
      queueUrl,
      messageBody,
    });

    throw new Error("Failed to send message to sqs");
  }
};

module.exports = {
  sqsClient,
  sendMessageToSQS,
};
