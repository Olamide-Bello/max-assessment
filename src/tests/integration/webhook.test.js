const request = require("supertest");
const app = require("../../server");
const { WEBHOOK_EVENTS } = require("../../services/webhookHandler");
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const crypto = require('crypto');

describe("Webhook Routes - Integration Tests", () => {
  let testUser;

  beforeEach(async () => {  // Changed from beforeAll to beforeEach
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

  afterEach(async () => {  // Changed from afterAll to afterEach
    await User.deleteMany({});
    await Transaction.deleteMany({});
  });

  const generateSignature = (payload) => {
    const hmac = crypto.createHmac("sha256", process.env.SAFEHAVEN_WEBHOOK_SECRET);
    return hmac.update(JSON.stringify(payload)).digest("hex");
  };

  test("POST /webhooks/safehaven - should process successful transaction", async () => {
    const payload = {
      event: WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL,
      data: {
        accountNumber: "1234567890",
        amount: 10000,
        transactionId: "txn_123456",
      },
    };

    const response = await request(app)
      .post("/api/webhooks/safehaven")
      .set("x-safehaven-signature", generateSignature(payload))
      .send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");

    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.balance).toBe(15000);
  });

  test("POST /webhooks/safehaven - should handle failed transaction", async () => {
    const payload = {
      event: WEBHOOK_EVENTS.TRANSACTION_FAILED,
      data: {
        accountNumber: "1234567890",
        amount: 10000,
        transactionId: "txn_failed_123",
        responseMessage: "Insufficient funds"
      },
    };

    const response = await request(app)
      .post("/api/webhooks/safehaven")
      .set("x-safehaven-signature", generateSignature(payload))
      .send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");

    const transaction = await Transaction.findOne({ transactionId: payload.data.transactionId });
    expect(transaction.status).toBe("Failed");
  });

  test("POST /webhooks/safehaven - should reject invalid signature", async () => {
    const payload = {
      event: WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL,
      data: {
        accountNumber: "1234567890",
        amount: 10000,
        transactionId: "txn_123456",
      },
    };

    const response = await request(app)
      .post("/api/webhooks/safehaven")
      .set("x-safehaven-signature", "invalid_signature")
      .send(payload);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid signature");
  });

  test("POST /webhooks/safehaven - should return 400 for missing parameters", async () => {
    const response = await request(app)
      .post("/api/webhooks/safehaven")
      .set("x-safehaven-signature", generateSignature({}))
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Missing required webhook parameters");
  });
});