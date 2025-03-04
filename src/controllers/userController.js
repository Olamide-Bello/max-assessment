const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        // Fetch user from database
        const user = await User.findById(req.user.userId).select("firstName lastName email virtualAccountNumber");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const updateFields = {};

        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
