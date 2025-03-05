const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("User Routes - Integration Tests", () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Clean up users collection
    await User.deleteMany({});
    
    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: hashedPassword
    });
    
    userId = user._id;
    token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'test-secret', 
      { expiresIn: "1h" }
    );
  });

  describe("GET /api/user/profile", () => {
    it("should fetch user profile successfully", async () => {
      const response = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com"
      });
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app)
        .get("/api/user/profile");

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Authorization token required");
    });

    test("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/user/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "Invalid token format",
        error: "token_invalid"
      });
    });
  });

  describe("PUT /user/profile", () => {
    test("should update user profile successfully", async () => {
      const response = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Jane",
          lastName: "Smith"
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Profile updated successfully");

      // Verify the update
      const updatedUser = await User.findById(userId);
      expect(updatedUser.firstName).toBe("Jane");
      expect(updatedUser.lastName).toBe("Smith");
    });

    test("should return 400 when no fields to update", async () => {
      const response = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("No fields to update");
    });

    test("should handle non-existent user", async () => {
      // Delete the user first
      await User.findByIdAndDelete(userId);

      const response = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Jane"
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    test("should validate update fields", async () => {
      const response = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "",  // empty string should fail validation
          lastName: "Smith"
        });

      expect(response.statusCode).toBe(400);
    });
  });
});