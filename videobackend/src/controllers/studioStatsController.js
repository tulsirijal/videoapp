
import prisma from "../db/prisma.js";

const getStudioAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    
    const videos = await prisma.video.findMany({
      where: { userId },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { views: 'desc' }
    });

    
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
    const totalLikes = videos.reduce((acc, video) => acc + video._count.likes, 0);
    
    const subscriberCount = await prisma.subscription.count({
      where: { subscribedToId: userId }
    });

    
    const chartData = videos.slice(0, 5).map(v => ({
      name: v.title.substring(0, 10) + "...",
      views: v.views,
      likes: v._count.likes
    }));

    return res.status(200).json({
      summary: {
        totalViews,
        subscriberCount,
        totalLikes,
        totalVideos: videos.length,
        channelId: userId
      },
      videos, 
      chartData 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { getStudioAnalytics };