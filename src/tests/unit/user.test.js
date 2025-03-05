const { getUserProfile, updateUserProfile } = require("../../controllers/userController");
const User = require("../../models/User");

// Mock dependencies
jest.mock("../../models/User");

describe("User Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "12345" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    test("should get user profile successfully", async () => {
      const mockUser = {
        _id: "12345",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        virtualAccountNumber: "1234567890"
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("12345");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("should return 404 if user not found", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("updateUserProfile", () => {
    test("should update user profile successfully", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith"
      };
      req.body = updateData;

      const mockUpdatedUser = {
        _id: "12345",
        ...updateData
      };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "12345",
        updateData,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Profile updated successfully" });
    });

    test("should return 400 if no fields to update", async () => {
      req.body = {};

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No fields to update" });
    });

    test("should return 404 if user not found during update", async () => {
      req.body = { firstName: "Jane" };
      User.findByIdAndUpdate.mockResolvedValue(null);

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });
});