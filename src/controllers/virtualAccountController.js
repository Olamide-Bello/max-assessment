const axios = require("axios");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const safehavenApi = require('../services/safehavenApi');
const User = require("../models/User");

exports.createVirtualAccount = async (req, res) => {

    try {

        const payload = {
            validFor: 900,
            settlementAccount: {
                bankCode: process.env.SETTLEMENT_BANK_CODE,
                accountNumber: process.env.SETTLEMENT_ACCOUNT_NUMBER,
            },
            amountControl: "Fixed",
            callbackUrl: process.env.CALLBACK_URL,
            amount: 100000,
            externalReference: uuidv4(), 
        };

        // Call the Safehaven API to create the virtual account
        const result = await safehavenApi.createVirtualAccount(req.body);
    
        if (result.statusCode === 400) {
          return res.status(400).json({
            status: "error",
            message: result.message
          });
        }
        // Update user's virtual account number
        await User.findByIdAndUpdate(
            req.user.userId,
            { virtualAccountNumber: result.data.accountNumber },
            { new: true }
        );

        // Return the response to the client
        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        console.error('Error creating virtual account:', error.message);

        // Handle errors from the Safehaven API
        if (error.response) {
            res.status(error.response.status).json({
                status: 'error',
                message: error.response.data.message || 'Failed to create virtual account',
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'An internal server error occurred',
            });
        }
    }
};
