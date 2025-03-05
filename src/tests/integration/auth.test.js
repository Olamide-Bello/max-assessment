const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Auth Routes - Integration Tests", () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  }, 30000);

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "password123"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User registered successfully");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123"
      });
      await user.save();
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john.doe@example.com",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });
});