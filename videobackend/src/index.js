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

app.get("/", (req, res) => {
  res.send("Video Backend is running...");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
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


export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

setIo(io);
io.adapter(createAdapter(pubClient, subClient));
setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server and WS listening at port ${PORT}`);
  
  initViewSync();
});