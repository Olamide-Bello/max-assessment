const jwt = require("jsonwebtoken");

// Middleware to validate JWT tokens and attach user data to request
const authMiddleware = (req, res, next) => {
    // Extract JWT from Authorization header
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        // Remove 'Bearer ' prefix and verify token
        // Throws errors if token is invalid or expired
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        
        // Attach decoded user data for use in subsequent route handlers
        req.user = decoded;
        next();
    } catch (error) {
        // Handle specific JWT validation errors with appropriate responses
        if (error.name === 'TokenExpiredError') {
            // Provide specific error messages for different JWT validation failures
            return res.status(401).json({ 
                message: "Token has expired",
                error: "token_expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token format",
                error: "token_invalid"
            });
        } else {
            return res.status(401).json({ 
                message: "Token validation failed",
                error: "token_verification_failed"
            });
        }
    }
};

module.exports = authMiddleware;