require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth.route");
const taskRouter = require("./routes/task.route");
const friendRequestRoutes = require("./routes/friend.route");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();
app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    skip: () => process.env.NODE_ENV === "test",
    message: { success: false, message: "Too many requests, please try again later." }
});

// Stricter limiter for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 signup/signin attempts per 15 mins per IP
    skip: () => process.env.NODE_ENV === "test",
    message: { success: false, message: "Too many authentication attempts. Please try again after 15 minutes." }
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use("/api/friends", friendRequestRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);
const port = process.env.PORT || 5000;

let server;
const startServer = async () => {
    try {
        await connectDB();

        server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        return server;
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "test") {
    startServer();
}

module.exports = { app, startServer };