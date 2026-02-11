import prisma from "../db/prisma.js";
import { pubClient } from "../db/redis.js";
import { getIo } from "../services/socketStore.js";
import { uploadVideoBuffer } from "../services/cloudinary.js";
import { Queue } from "bullmq";

const notificationQueue = new Queue("notificationQueue", {
  connection: pubClient,
});

const videoUpload = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must login first" });
    }
    const { title, description } = req.body;
    const videoFile = req.file;
    if (!videoFile) {
      return res.status(401).json({ message: "Video File required." });
    }
    const result = await uploadVideoBuffer(videoFile.buffer, "videos");
    const thumbnail = result.secure_url.replace(
      "/upload/",
      "/upload/w_200,h_200,c_fill/",
    );
    const video = await prisma.video.create({
      data: {
        title,
        description,
        url: result.secure_url,
        thumbnail: thumbnail,
        userId: user.id,
      },
    });

    notificationQueue.add("newVideo", {
      senderId: user.id,
      type: "VIDEO_UPLOADED",
      videoId: video.id,
      title: video.title,
    });

    return res.status(200).json({ message: "Upload successfull" });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const removeVideo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }
    const videoId = parseInt(req.params.videoId);

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo || existingVideo.userId !== user.id) {
      return res
        .status(403)
        .json({ message: "Video not found or unauthorized" });
    }

    const removeVid = await prisma.video.delete({
      where: {
        id: videoId,
      },
    });
    return res.status(200).json({ message: "Video deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editVideo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }
    const videoId = parseInt(req.params.videoId);
    const { title, description } = req.body;

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo || existingVideo.userId !== user.id) {
      return res
        .status(403)
        .json({ message: "Video not found or unauthorized" });
    }

    const updatedVid = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        title,
        description,
      },
    });
    return res
      .status(200)
      .json({ message: "Video updated", video: updatedVid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        user: { select: { id: true, firstname: true, lastname: true } },
      },
    });
    return res.status(200).json({ message: videos });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVideo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const video = await prisma.video.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        user: true,
      },
    });
    return res.status(200).json({ message: video });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addViews = async (req, res) => {
  try {
    const io = getIo();
    const userId = req.user?.id;
    const videoId = parseInt(req.params.videoId);

    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const redisKey = `video:views:${videoId}`;
    const uniqueViewsKey = `video:unique_views:${videoId}`;

    // For guests, just return current count
    if (!userId) {
      const currentViews = await pubClient.get(redisKey);
      return res.status(200).json({
        message: "Guest view",
        views: parseInt(currentViews) || 0,
      });
    }

    // Check if this is a unique view
    const isNewView = await pubClient
      .pipeline()
      .sadd(uniqueViewsKey, userId.toString())
      .expire(uniqueViewsKey, 86400)
      .exec();

    const saddResult = isNewView[0][1];
    const saddError = isNewView[0][0];

    if (!saddError && saddResult === 1) {
      // Ensure Redis key exists (seed from DB if needed)
      const exists = await pubClient.exists(redisKey);

      if (!exists) {
        const video = await prisma.video.findUnique({
          where: { id: videoId },
          select: { views: true },
        });

        if (!video) {
          return res.status(404).json({ message: "Video not found" });
        }

        await pubClient.set(redisKey, video.views, "EX", 86400);
      }

      const newCount = await pubClient.incr(redisKey);

      // Mark for database sync - ALWAYS add to sync queue
      await pubClient.sadd("videos_to_sync", videoId.toString());
      
      console.log(`View added for video ${videoId}, new count: ${newCount}`);

      io.to(`video_${videoId}`).emit("current_views", {
        videoId,
        views: newCount,
      });

      return res.status(200).json({
        message: "View added",
        views: newCount,
      });
    }

    const currentViews = await pubClient.get(redisKey);
    return res.status(200).json({
      message: "Already viewed today",
      views: parseInt(currentViews) || 0,
    });
  } catch (error) {
    console.error("AddView Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getTotalViews = async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { views: true },
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.status(200).json({ views: video.views });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchVideos = async (req, res) => {
  try {
    const query = req.body.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // `websearch_to_tsquery` handles human inputs like "cats -dogs" automatically.

    const videos = await prisma.$queryRaw`
      SELECT 
        v.id, 
        v.title, 
        v.description, 
        v.url, 
        v.thumbnail, 
        v.views, 
        v."createdAt", 
        v.duration,
        u.id as "userId",
        u.firstname, 
        u.lastname, 
        ts_rank(v.search_vector, websearch_to_tsquery('english', ${query})) as rank
      FROM "Video" v
      JOIN "User" u ON v."userId" = u.id
      WHERE v.search_vector @@ websearch_to_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 20;
    `;

    const formattedVideos = videos.map((video)=>{
      return {
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnail: video.thumbnail,
        views: video.views,
        createdAt: video.createdAt,
        duration: video.duration,
        user: {
          id: video.userId,
          firstname: video.firstname,
          lastname: video.lastname
        },
        _count: {
          likes: Number(video.likeCount) || 0, 
          comments: Number(video.commentCount) || 0, 
        }
      }
    })

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Internal server error during search" });
  }
};

export {
  videoUpload,
  removeVideo,
  getAllVideos,
  getVideo,
  addViews,
  getTotalViews,
  searchVideos,
  editVideo,
};
