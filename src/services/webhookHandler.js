const User = require("../models/User");
const Transaction = require("../models/Transaction");

const WEBHOOK_EVENTS = {
    TRANSACTION_SUCCESSFUL: 'transaction_successful',
    TRANSACTION_FAILED: 'transaction_failed',
};

const handleTransactionSuccessful = async (data) => {
    const { accountNumber, amount, transactionId } = data;

    // Find the user by the virtual account number
    const user = await User.findOne({ virtualAccountNumber: accountNumber });
    if (!user) {
        throw new Error(`User with virtual account ${accountNumber} not found`);
    }

    // Update the user's balance
    user.balance += amount;
    await user.save();

    // Save the transaction details
    const transaction = new Transaction({
        transactionId,
        userId: user._id,
        accountNumber,
        type: 'credit',
        amount,
        status: "Completed",
        responseCode: "00",
        responseMessage: "Transaction successful",
    });
    await transaction.save();
    return true;
}

const handleTransactionFailed = async (data) => {
    const { accountNumber, amount, transactionId, responseMessage } = data;

    const user = await User.findOne({ virtualAccountNumber: accountNumber });
    if (!user) {
        // Create failed transaction even if user is not found
        const transaction = new Transaction({
            transactionId,
            accountNumber,
            type: 'credit',
            amount,
            status: "Failed",
            responseCode: "99",
            responseMessage: responseMessage || "Transaction failed - User not found",
        });
        await transaction.save();
        return true;
    }

    const transaction = new Transaction({
        transactionId,
        userId: user._id,
        accountNumber,
        type: 'credit',
        amount,
        status: "Failed",
        responseCode: "99",
        responseMessage: responseMessage || "Transaction failed",
    });
    await transaction.save();
    return true;
};

const processWebhookEvent = async (event, data) => {
    console.log(`Processing webhook event: ${event}`);
    switch (event) {
        case WEBHOOK_EVENTS.TRANSACTION_SUCCESSFUL:
            return await handleTransactionSuccessful(data);
        case WEBHOOK_EVENTS.TRANSACTION_FAILED:
            return await handleTransactionFailed(data);
        default:
            console.error(`Unhandled webhook event: ${event}`);
            throw new Error(`Unhandled webhook event: ${event}`);
    }
};

module.exports = {
    WEBHOOK_EVENTS,
    processWebhookEvent
};