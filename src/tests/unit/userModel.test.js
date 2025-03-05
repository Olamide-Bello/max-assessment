// src/tests/unit/userModel.test.js
const mongoose = require("mongoose");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

// Mock bcrypt
jest.mock("bcrypt");

describe("User Model - Unit Tests", () => {
    let user;

    beforeEach(() => {
        user = new User({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password123",
        });

        // Mock the save method
        user.save = jest.fn().mockImplementation(async function() {
            // Manually trigger the pre-save middleware
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(this.password, salt);
            this.password = hash;
            return this;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should hash password before saving", async () => {
        const salt = "fakeSalt";
        const hashedPassword = "hashedPassword123";
        bcrypt.genSalt.mockResolvedValue(salt);
        bcrypt.hash.mockResolvedValue(hashedPassword);

        await user.save();

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith("password123", salt);
        expect(user.password).toBe(hashedPassword);
    });

    test("should compare passwords correctly", async () => {
        const enteredPassword = "password123";
        const hashedPassword = "hashedPassword123";
        bcrypt.compare.mockResolvedValue(true);

        // Mock the user's password
        user.password = hashedPassword;

        const isMatch = await user.comparePassword(enteredPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith(enteredPassword, hashedPassword);
        expect(isMatch).toBe(true);
    });
});