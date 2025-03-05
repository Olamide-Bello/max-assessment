const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/authMiddleware");

// Mock jwt.verify
jest.mock("jsonwebtoken");

describe("Auth Middleware - Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 if no token is provided", () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authorization token required" });
  });

  test("should return 401 if token is expired", () => {
    req.header.mockReturnValue("Bearer expiredToken");
    jwt.verify.mockImplementation(() => {
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      throw error;
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Token has expired",
      error: "token_expired"
    });
  });

  test("should return 401 if token format is invalid", () => {
    req.header.mockReturnValue("Bearer invalidToken");
    jwt.verify.mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Invalid token format",
      error: "token_invalid"
    });
  });

  test("should return 401 for other token verification failures", () => {
    req.header.mockReturnValue("Bearer problematicToken");
    jwt.verify.mockImplementation(() => {
      throw new Error("Some other error");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Token validation failed",
      error: "token_verification_failed"
    });
  });

  test("should set req.user and call next() if token is valid", () => {
    req.header.mockReturnValue("Bearer validToken");
    const decoded = { userId: "12345" };
    jwt.verify.mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});