import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import videoRoutes from './routes/videos.js'
import userRoutes from './routes/user.js'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,               
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(authRoutes);
app.use(videoRoutes);


export default app;
