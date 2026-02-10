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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean); 

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(authRoutes);
app.use(videoRoutes);


export default app;
