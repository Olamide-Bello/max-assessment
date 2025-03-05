const User = require("../models/User");

// Retrieve user profile excluding sensitive information
exports.getUserProfile = async (req, res) => {
    try {
        // Select only necessary fields for profile display
        const user = await User.findById(req.user.userId).select("firstName lastName email virtualAccountNumber");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        // Error handling for fetching user profile
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update user profile fields with validation
exports.updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const updateFields = {};

        // Only include provided fields in update operation
        if (firstName !== undefined) {
            updateFields.firstName = firstName.trim();
        }
        
        if (lastName !== undefined) {
            updateFields.lastName = lastName.trim();
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            updateFields,
            { new: true, runValidators: true }  // Ensure validation runs on update
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        // Error handling for updating user profile
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};
