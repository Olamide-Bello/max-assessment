const axios = require("axios");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const safehavenApi = require('../services/safehavenApi');
const User = require("../models/User");

/**
 * Creates a virtual account for a user
 * 
 * @route POST /api/banking/virtual-account
 * @param {Object} req.body - Request body
 * @param {Object} req.user - Authenticated user info from JWT
 * @returns {Object} Virtual account details or error message
 */
exports.createVirtualAccount = async (req, res) => {
    try {
        // Virtual account configuration:
        // - validFor: Account expires after 15 minutes for security
        // - amountControl: "Fixed" means the account only accepts exact amount specified
        // - externalReference: UUID ensures each request is unique and traceable
        const payload = {
            validFor: 900, // Account validity in seconds (15 minutes)
            settlementAccount: {
                bankCode: process.env.SETTLEMENT_BANK_CODE, // Bank code from env
                accountNumber: process.env.SETTLEMENT_ACCOUNT_NUMBER, // Settlement account from env
            },
            amountControl: "Fixed", // Type of amount control (Fixed/Flexible)
            callbackUrl: process.env.CALLBACK_URL, // Webhook URL for payment notifications
            amount: 100000, 
            externalReference: uuidv4(), // Unique reference for this transaction
        };

        // Request virtual account from Safehaven
        const result = await safehavenApi.createVirtualAccount(req.body);
    
        // Handle validation errors from Safehaven
        if (result.statusCode === 400) {
            return res.status(400).json({
                status: "error",
                message: result.message
            });
        }

        // Only update user profile if virtual account was created successfully
        await User.findByIdAndUpdate(
            req.user.userId,
            { virtualAccountNumber: result.data.accountNumber },
            { new: true }
        );

        // Return success response with virtual account details
        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        console.error('Error creating virtual account:', error.message);

        // Handle specific API errors
        if (error.response) {
            res.status(error.response.status).json({
                status: 'error',
                message: error.response.data.message || 'Failed to create virtual account',
            });
        } else {
            // Handle unexpected errors
            res.status(500).json({
                status: 'error',
                message: 'An internal server error occurred',
            });
        }
    }
};
