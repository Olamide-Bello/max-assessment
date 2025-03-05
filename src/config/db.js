const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    // Skip database connection in test environment
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    try {
        const dbUrl = process.env.NODE_ENV === 'production'
            ? process.env.MONGO_URI
            : process.env.MONGO_URI_DEV;

        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
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
