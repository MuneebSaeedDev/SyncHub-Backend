// 1. Async Handler wrapper to eliminate try/catch in controllers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 2. Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // Handle Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `This ${field} is already registered`;
    }

    // Handle Mongoose Schema Validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
    }

    // Handle JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired. Please sign in again.";
    }

    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
        console.error("Error Details:", err);
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = { asyncHandler, errorHandler };
