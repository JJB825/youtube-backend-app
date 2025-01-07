import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// configuring middlewares

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// for handling form data
app.use(express.json({ limit: "16kb" }));
// for handling url data
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// for storing public static assets like files, images, etc: always stored in public folder
app.use(express.static("public"));

// cookie-parser
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter); // this means whenever the url hits /users the control is provided to userRouter -> url: http://localhost:8000/api/v1/users/register

export { app };
