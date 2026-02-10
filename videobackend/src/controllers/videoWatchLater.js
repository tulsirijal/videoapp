import prisma from "../db/prisma.js";

export const addToWatchLater = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must login first" });
    }
    const videoId = parseInt(req.params.videoId);

    const existingEntry = await prisma.watchLater.findFirst({
      where: {
        userId: user.id,
        videoId: videoId,
      },
    });

    if (existingEntry) {
      return res.status(409).json({ message: "Video already in Watch Later" });
    }

    await prisma.watchLater.create({
      data: {
        userId: user.id,
        videoId: videoId,
      },
    });

    return res.status(200).json({ message: "Video added to Watch Later" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWatchLater = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }

    const watchLaterList = await prisma.watchLater.findMany({
      where: {
        userId: user.id,
      },
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
      orderBy: {
        addedAt: "desc",
      },
    });

    return res.status(200).json({ watchLater: watchLaterList });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeFromWatchLater = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must log in " });
    }
    const videoId = parseInt(req.params.videoId);

    await prisma.watchLater.deleteMany({
      where: {
        userId: user.id,
        videoId: videoId,
      },
    });

    return res.status(200).json({ message: "Video removed from Watch Later" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

