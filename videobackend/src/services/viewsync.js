import cron from "node-cron";
import prisma from "../db/prisma.js";
import { pubClient } from "../db/redis.js";

export const initViewSync = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("--- Starting View Sync: Redis to Postgres ---");

    try {
      // Check what's in the set
      const keys = await pubClient.smembers("videos_to_sync");
      console.log(`Found ${keys.length} videos to sync:`, keys); 

      if (keys.length === 0) {
        console.log("No views to sync.");
        return;
      }
      
      for (const key of keys) {
        const videoId = parseInt(key);
        const redisKey = `video:views:${videoId}`;
        const views = await pubClient.get(redisKey);

        console.log(`Processing video ${videoId}, views in Redis:`, views); 

        if (views && videoId) {
          await prisma.video.update({
            where: { id: videoId },
            data: { views: parseInt(views) },
          });
          
          // Remove from set after syncing
          const sremResult = await pubClient.srem("videos_to_sync", key);
          console.log(`Removed video ${videoId} from sync set. Result:`, sremResult); 
        }
        console.log(`Synced views for video ID: ${videoId}`);
      }

      console.log(`Successfully synced ${keys.length} videos.`);
    } catch (error) {
      console.error("Error during View Sync:", error);
    }
  });
};``