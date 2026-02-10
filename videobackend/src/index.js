
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import dotenv from "dotenv";
import app from "./app.js";
import { pubClient, subClient } from "./db/redis.js";
import { initViewSync } from "./services/viewsync.js";
import { setupSocketHandlers } from "./services/socket.js"; 
import prisma from "./db/prisma.js";
import { setIo } from "./services/socketStore.js";


dotenv.config();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

setIo(io); // Store the io instance for use in controllers and services

// Setup Redis Adapter
io.adapter(createAdapter(pubClient, subClient));

// Use the externalized handlers
setupSocketHandlers(io);

// Services
initViewSync();

server.listen(PORT, () => {
  console.log(`Server and WS listening at port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Video Backend is running...");
});


app.get("/health", (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await pubClient.ping();
    res.status(200).send("OK");

  } catch (error) {
    res.status(503).send("Service Unavailable");
  }
});