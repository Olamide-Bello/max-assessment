const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
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