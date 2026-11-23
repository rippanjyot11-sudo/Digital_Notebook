import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/user.routes.js";
import subjectRouter from "./src/routes/subject.routes.js";
import noteRouter from "./src/routes/notes.routes.js";
import aiRouter from "./src/routes/ai.routes.js";
import { ApiError } from "./src/utils/apiError.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["*"];

app.use(cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.status(200).json({ success: true, message: "Digital Notebook API is running" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/ai", aiRouter);

app.use((req, _res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
});

app.use((error, _req, res, _next) => {
    let statusCode = Number(error.statusCode) || 500;
    let message = error.message || "Internal server error";

    if (error.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(error.errors).map((item) => item.message).join(", ");
    } else if (error.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    } else if (error.code === 11000) {
        statusCode = 409;
        message = "Duplicate value";
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    });
});

export { app };