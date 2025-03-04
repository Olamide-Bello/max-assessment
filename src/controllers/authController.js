const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate all the input fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      console.log("User found:", user);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      console.log("Entered Password:", password);
      console.log("Stored Hashed Password:", user.password);

  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error); // Log the actual error
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };