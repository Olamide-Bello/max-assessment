const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    // Skip DB connection during tests to improve test speed
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    try {
        // Use different connection strings for production and development
        const dbUrl = process.env.NODE_ENV === 'production'
            ? process.env.MONGO_URI
            : process.env.MONGO_URI_DEV;

        // Configure MongoDB connection with timeout settings for better reliability
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 10000, // Give up initial connection after 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        // Don't exit in test environment
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
