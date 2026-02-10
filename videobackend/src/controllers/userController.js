import prisma from "../db/prisma.js";

export const getUserInfo = async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const user = await prisma.user.findUnique({ where: { id: channelId } });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const userInfo = await prisma.user.findUnique({ where: { id: user.id }, include:{videos:true, subscriptions:true, likes:true,subscribers:true} });
    if (!userInfo) {
      return res.status(401).json({ message: "User does not exist" });
    }
    return res.status(200).json({userInfo});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });

  }
};

export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
    });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" , error: error.message});

  }
};

export const getChannelInfoWithVideos = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const channelInfo = await prisma.user.findUnique({
      where: { id: id },
      include: { videos: true, _count: { select: { subscribers: true } } },
    });
    return res.status(200).json({ channelInfo });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });

  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message});

  }
};
