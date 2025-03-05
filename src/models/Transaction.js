const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    required: true,
  },
  responseCode: {
    type: String,
    required: true,
  },
  responseMessage: {
    type: String,
    required: true,
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);