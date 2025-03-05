const { registerUser, loginUser } = require("../../controllers/authController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock dependencies
jest.mock("../../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };
      req.body = userData;

      const mockUser = {
        _id: "12345",
        ...userData,
        save: jest.fn().mockResolvedValue({ _id: "12345", ...userData }),
      };

      // Mock User constructor
      User.mockImplementation(() => mockUser);
      // Mock findOne to simulate no existing user
      User.findOne.mockResolvedValue(null);
      
      // Mock hash password
      bcrypt.hash.mockResolvedValue("hashedPassword123");

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        userId: "12345",
      });
    });
  });

  describe("loginUser", () => {
    test("should login user with valid credentials", async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "password123",
      };
      req.body = loginData;

      const mockUser = {
        _id: "12345",
        email: loginData.email,
        password: "hashedPassword",
      };

      // Mock user found in database
      User.findOne.mockResolvedValue(mockUser);
      // Mock password comparison
      bcrypt.compare.mockResolvedValue(true);
      // Mock JWT token generation
      jwt.sign.mockReturnValue("mockedToken");

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: "mockedToken",
      });
    });
  });
});