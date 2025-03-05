// src/middleware/verifyWebhookSignature.js
const crypto = require("crypto");

const verifyWebhookSignature = (req, res, next) => {
  const secret = process.env.SAFEHAVEN_WEBHOOK_SECRET; // Shared secret key
  const signature = req.headers["x-safehaven-signature"]; // Signature sent by SafeHaven

  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }

  // Compute the HMAC signature
  const hmac = crypto.createHmac("sha256", secret);
  const computedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");

  // Compare the signatures
  if (signature !== computedSignature) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  // Signature is valid, proceed to the next middleware
  next();
};

module.exports = verifyWebhookSignature;