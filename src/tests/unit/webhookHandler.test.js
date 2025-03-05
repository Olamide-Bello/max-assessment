const mongoose = require('mongoose');
const { processWebhookEvent, WEBHOOK_EVENTS } = require("../../services/webhookHandler");
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');

describe("Webhook Handler - Unit Tests", () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+2341234567890',
      virtualAccountNumber: '1234567890',
      balance: 5000
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.connection.close();
  });

  test("should process transaction_successful webhook event", async () => {
    const event = WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL;
    const data = {
      accountNumber: "1234567890",
      amount: 10000,
      transactionId: "txn_123456",
    };

    await expect(processWebhookEvent(event, data)).resolves.toBe(true);
    
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.balance).toBe(15000);

    const transaction = await Transaction.findOne({ transactionId: data.transactionId });
    expect(transaction).toBeTruthy();
    expect(transaction.status).toBe('Completed');
    expect(transaction.type).toBe('credit');
    expect(transaction.userId).toEqual(testUser._id);
  });

  test("should process transaction_failed webhook event", async () => {
    const event = WEBHOOK_EVENTS.TRANSACTION_FAILED;
    const data = {
      accountNumber: "1234567890",
      amount: 10000,
      transactionId: "txn_failed_123",
      responseMessage: "Insufficient funds"
    };

    await expect(processWebhookEvent(event, data)).resolves.toBe(true);

    const transaction = await Transaction.findOne({ transactionId: data.transactionId });
    expect(transaction).toBeTruthy();
    expect(transaction.status).toBe('Failed');
  });

  test("should throw error for invalid account number", async () => {
    const event = WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL;
    const data = {
      accountNumber: "invalid_account",
      amount: 10000,
      transactionId: "txn_789012",
    };

    await expect(processWebhookEvent(event, data)).rejects.toThrow(
      "User with virtual account invalid_account not found"
    );
  });

  test("should throw an error for unhandled webhook events", async () => {
    const event = "unknown_event";
    const data = {
      accountNumber: "1234567890",
      amount: 10000,
      transactionId: "txn_123456",
    };

    await expect(processWebhookEvent(event, data)).rejects.toThrow(
      "Unhandled webhook event: unknown_event"
    );
  });
});