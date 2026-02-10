import { pubClient } from "../db/redis.js";
import prisma from "../db/prisma.js";

const PRESENCE_TTL = 30; // seconds

// Helper function to get the number of live viewers for a video
const getLiveViewers = async (videoId) => {
  const keys = await pubClient.keys(`video:presence:${videoId}:*`);
  return keys.length;
};

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      console.log(`User ${userId} joined ${userRoom} room`);
    }

    // --- Video Room Logic ---
    socket.on("join_video_room", async (videoId) => {
      const videoRoom = `video_${videoId}`;
      const viewCountKey = `video:views:${videoId}`;
      const presenceKey = `video:presence:${videoId}:${socket.id}`;
      socket.currentVideoId = videoId;
      const userId = socket.handshake.query.userId || socket.id;
      socket.join(videoRoom);

      try {
        await pubClient.sadd(presenceKey, "1", "EX", PRESENCE_TTL);
        const roomSize = await getLiveViewers(videoId);

        io.to(videoRoom).emit("live_viewers", {
          videoId,
          roomSize,
        });

        let currentViews = await pubClient.get(viewCountKey);

        if (currentViews === null) {
          const video = await prisma.video.findUnique({
            where: { id: parseInt(videoId) },
            select: { views: true },
          });
          currentViews = video ? video.views : 0;
          await pubClient.set(viewCountKey, currentViews, "EX", 86400);
        }

        socket.emit("current_views", {
          videoId,
          views: parseInt(currentViews),
        });
      } catch (error) {
        console.error("Socket Join Error:", error);
      }
    });

    socket.on("leave_video_room", async (videoId) => {
      const presenceKey = `video:presence:${videoId}:${socket.id}`;

      socket.leave(`video_${videoId}`);
      socket.currentVideoId = null;

      await pubClient.del(presenceKey);

      const roomSize = await getLiveViewers(videoId);

      io.to(`video_${videoId}`).emit("live_viewers", {
        videoId,
        roomSize,
      });
    });

    socket.on("video_heartbeat", async () => {
      const videoId = socket.currentVideoId;
      if (!videoId) return;

      const presenceKey = `video:presence:${videoId}:${socket.id}`;

      await pubClient.expire(presenceKey, PRESENCE_TTL);
    });

    // --- Channel Room Logic ---
    socket.on("join_channel_room", (channelId) => {
      socket.join(`channel_${channelId}`);
    });

    socket.on("leave_channel_room", (channelId) => {
      socket.leave(`channel_${channelId}`);
    });

    // --- Comment Room Logic ---
    socket.on("join_comment_room", (videoId) => {
      socket.join(`comments_${videoId}`);
    });

    socket.on("leave_comment_room", (videoId) => {
      socket.leave(`comments_${videoId}`);
    });

    // --- whenever the user disconnects ---
    socket.on("disconnect", async () => {
      const videoId = socket.currentVideoId;
      if (!videoId) return;

      await pubClient.del(`video:presence:${videoId}:${socket.id}`);
      socket.leave(`user_${userId}`);

      const count = await getLiveViewers(videoId);

      io.to(`video_${videoId}`).emit("live_viewers", {
        videoId,
        roomSize: count,
      });
    });
  });
};
