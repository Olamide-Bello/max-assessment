// src/middleware/verifyWebhookSignature.js
const crypto = require("crypto");

const verifyWebhookSignature = (req, res, next) => {
  // SafeHaven sends a unique signature in headers to verify webhook authenticity
  const secret = process.env.SAFEHAVEN_WEBHOOK_SECRET; // Shared secret key
  const signature = req.headers["x-safehaven-signature"]; // Signature sent by SafeHaven

  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }

  // Create HMAC signature using SHA256 algorithm
  // This ensures webhook payload hasn't been tampered with during transmission
  const hmac = crypto.createHmac("sha256", secret);
  const computedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");

  // Compare the signatures
  if (signature !== computedSignature) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  next();
};

module.exports = verifyWebhookSignature;