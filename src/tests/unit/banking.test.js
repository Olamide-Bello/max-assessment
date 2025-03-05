const { createVirtualAccount } = require("../../controllers/virtualAccountController");
const safehavenApi = require("../../services/safehavenApi");
const User = require("../../models/User");

// Mock safehavenApi and User model
jest.mock("../../services/safehavenApi");
jest.mock("../../models/User");

describe("Virtual Account Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "12345" },
      body: {
        validFor: 900,
        amountControl: "Fixed",
        amount: 100000,
        callbackUrl: "https://example.com",
        settlementAccount: {
          bankCode: "090286",
          accountNumber: "0116587163"
        },
        externalReference: expect.any(String)
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createVirtualAccount - successful creation", async () => {
    const mockResponse = {
      data: {
        accountNumber: "1234567890",
        expiresAt: "2024-01-01T00:00:00Z",
        status: "active"
      }
    };
    
    safehavenApi.createVirtualAccount.mockResolvedValue(mockResponse);
    User.findByIdAndUpdate.mockResolvedValue({
      _id: "12345",
      virtualAccountNumber: "1234567890"
    });

    await createVirtualAccount(req, res);

    expect(safehavenApi.createVirtualAccount).toHaveBeenCalledWith(req.body);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "12345",
      { virtualAccountNumber: mockResponse.data.accountNumber },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockResponse
    });
  });

  test("createVirtualAccount - API error handling", async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: {
          message: "Invalid amount"
        }
      }
    };
    safehavenApi.createVirtualAccount.mockRejectedValue(errorResponse);

    await createVirtualAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Invalid amount"
    });
  });

  test("createVirtualAccount - internal server error", async () => {
    safehavenApi.createVirtualAccount.mockRejectedValue(new Error("Network error"));

    await createVirtualAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "An internal server error occurred"
    });
  });
});