import prisma from "../db/prisma.js";

const addHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }
    const videoId = parseInt(req.params.videoId);

    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    await prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: parseInt(videoId),
        },
      },
      // If it exists, just update the timestamp to "now"
      update: {
        watchedAt: new Date(),
      },
      // If it doesn't exist, create a new entry
      create: {
        userId: user.id,
        videoId: parseInt(videoId),
        watchedAt: new Date(),
      },
    });

    return res.status(200).json({ message: "Watch history added" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }

    const history = await prisma.watchHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        watchedAt: "desc",
      },
      take: 10,
      include: {
        video: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }
    const historyId = parseInt(req.params.historyId);

    await prisma.watchHistory.deleteMany({
      where: {
        id: historyId,
        userId: user.id,
      },
    });

    return res.status(200).json({ message: "Watch history deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAllHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }

    await prisma.watchHistory.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({ message: "All watch history cleared" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export {  addHistory,
  getHistory,
  deleteHistory,
  deleteAllHistory
};