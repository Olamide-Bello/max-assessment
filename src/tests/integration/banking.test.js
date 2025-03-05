const request = require("supertest");
const app = require("../../server");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("Banking Routes - Integration Tests", () => {
  let token;
  let user;

  beforeEach(async () => {
    await User.deleteMany({});
    // Create a test user
    user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    });
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /banking/virtual-accounts", () => {
    const validPayload = {
      validFor: 900,
      amountControl: "Fixed",
      amount: 100000,
      callbackUrl: "https://example.com",
      settlementAccount: {
        bankCode: "090286",
        accountNumber: "0116587163"
      }
    };

    test("should create a virtual account with valid payload", async () => {
      const response = await request(app)
        .post("/api/banking/virtual-account")
        .set("Authorization", `Bearer ${token}`)
        .send(validPayload);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: {
          data: {
            accountNumber: expect.any(String),
            expiresAt: expect.any(String),
            status: "active"
          }
        }
      });

      // Verify user update
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.virtualAccountNumber).toBe(response.body.data.data.accountNumber);
    });

    test("should handle API 400 error response", async () => {
      const response = await request(app)
        .post("/api/banking/virtual-account")
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...validPayload,
          amount: -1 // Invalid amount
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        status: "error",
        message: expect.any(String)
      });
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/api/banking/virtual-account")
        .send(validPayload);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Authorization token required");
    });

    test("should return 401 when invalid token is provided", async () => {
      const response = await request(app)
        .post("/api/banking/virtual-account")
        .set("Authorization", "Bearer invalid_token")
        .send(validPayload);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "Invalid token format",
        error: "token_invalid"
      });
    });

    test("should return 401 when expired token is provided", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post("/api/banking/virtual-account")
        .set("Authorization", `Bearer ${expiredToken}`)
        .send(validPayload);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "Token has expired",
        error: "token_expired"
      });
    });
  });
});