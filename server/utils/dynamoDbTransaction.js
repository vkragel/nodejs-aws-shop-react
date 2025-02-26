const { dynamoDb } = require("./dynamoDb");
const { TransactWriteCommand } = require("@aws-sdk/lib-dynamodb");

const generateTransaction = (operations) => {
  const transactItems = operations.map((operation) => {
    const { Action, TableName, Item } = operation;

    if (!TableName || !Action || !Item) {
      throw new Error(
        "Each operation must have TableName, Action, and either Item or Key"
      );
    }

    const transactionItem = {
      [Action]: {
        TableName,
        Item,
      },
    };

    return transactionItem;
  });

  return { TransactItems: transactItems };
};

const transactWrite = async (params) => {
  try {
    const command = new TransactWriteCommand(params);
    const response = await dynamoDb.send(command);

    return response;
  } catch (error) {
    console.error("Transaction error:", error.message);
    throw new Error("Failed to execute transaction");
  }
};

module.exports = { generateTransaction, transactWrite };
