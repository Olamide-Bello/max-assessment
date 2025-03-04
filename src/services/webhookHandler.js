const WEBHOOK_EVENTS = {
  TRANSACTION_SUCCESSFUL: 'transaction_successful',
  TRANSACTION_FAILED: 'transaction_failed',
  ACCOUNT_CREATED: 'account_created'
};

const handleTransactionSuccessful = async (data) => {
  const { accountNumber, amount, transactionId } = data;
  // TODO: Implement transaction success logic
  // e.g., update transaction status in database
  console.log(`Processing successful transaction ${transactionId}`);
  return true;
};

const processWebhookEvent = async (event, data) => {
  switch (event) {
    case WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL:
      return await handleTransactionSuccessful(data);
    default:
      throw new Error(`Unhandled webhook event: ${event}`);
  }
};

module.exports = {
  WEBHOOK_EVENTS,
  processWebhookEvent
};
