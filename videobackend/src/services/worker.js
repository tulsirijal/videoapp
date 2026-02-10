import { Worker } from "bullmq";
import prisma from "../db/prisma.js";
import { sendNotification } from "./notificationEmitter.js";
import { sendEmail } from "./mailService.js";
import { pubClient } from "../db/redis.js";

const worker = new Worker(
  "notificationQueue",
  async (job) => {
    if (job.name === "newVideo") {
      const { senderId, type, videoId, title } = job.data;
      const subscribers = await prisma.subscription.findMany({
        where: {
          subscribedToId: senderId,
        },
        include: {
          subscriber: true,
        },
      });
      const uploader = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstname: true },
      });
      const uploaderName = uploader ? uploader.firstname : "Someone";
      const videoTitle = title || "a new video";

      for (const sub of subscribers) {
        const emailHtml = `
      <h1>New Video from ${uploaderName}!</h1>
      <p>Click the link below to watch <b>${videoTitle}</b>:</p>
      <a href="http://localhost:3000/video/${videoId}">Watch Now</a>
    `;

        await sendEmail(
          sub.subscriber.email,
          `New Upload: ${videoTitle}`,
          emailHtml
        );
        await sendNotification({
          receiverId: sub.subscriberId,
          senderId,
          type,
          videoId,
        });
      }
    }
  },
  {
    connection: pubClient,
    limiter:{
        max: 1,
        duration: 3000,
    },
    autorun: true,
  }
);

worker.on("ready", () => console.log(" Worker is connected and listening!"));

worker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job with id ${job.id} has failed with error ${err.message}`);
});

export default worker;
