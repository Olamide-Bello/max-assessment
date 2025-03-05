const mongoose = require("mongoose");

// Define the schema for a transaction
const TransactionSchema = new mongoose.Schema({
  // Unique identifier for the transaction
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  // Reference to the user who made the transaction
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Account number associated with the transaction
  accountNumber: {
    type: String,
    required: true,
  },
  // Type of transaction: credit or debit
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  // Amount of the transaction
  amount: {
    type: Number,
    required: true,
  },
  // Status of the transaction
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    required: true,
  },
  // Response code from the payment provider
  responseCode: {
    type: String,
    required: true,
  },
  // Response message from the payment provider
  responseMessage: {
    type: String,
    required: true,
  },
  // Flexible key-value store for additional transaction data
  // Useful for storing provider-specific information
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);