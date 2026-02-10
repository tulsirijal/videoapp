import { Emitter } from "@socket.io/redis-emitter";
import { pubClient } from "../db/redis.js";
import prisma from "../db/prisma.js";

const emitter = new Emitter(pubClient);

export const sendNotification = async ({
  receiverId,
  senderId,
  type,
  videoId,
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        receiverId,
        senderId,
        videoId,
      },
      include: {
        sender: true,
      },
    });

    // Use Redis emitter instead of io directly
    emitter.to(`user_${receiverId}`).emit("newNotification", notification);
  } catch (error) {
    console.log("Error in sending notification:", error);
  }
};