import prisma from "../db/prisma.js";
import { sendNotification } from "../services/notificationEmitter.js";

const likeVideo = async (req, res) => {
  try {
    const user = req.user;
    const videoId = parseInt(req.params.videoId);
    if (!user) {
      return res.status(401).json({
        message: "Must log in to like the video",
      });
    }
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
    });
    // if like exists, remove it
    if (existingLike) {
      const deleteLike = await prisma.like.delete({
        where: {
          userId_videoId: {
            userId: user.id,
            videoId,
          },
        },
      });
      return res.status(200).json({ message: "like removed!!" });
    } else {
      const newLike = await prisma.like.create({
        data: {
          userId: user.id,
          videoId,
        },
      });

      // Send notification to the video owner
      if(video.userId != user.id){
        await sendNotification({
        receiverId:video.userId,
        senderId:user.id,
        type:"LIKE",
        videoId:video.id
      })
    }


      return res.status(200).json({ message: "Liked the video!" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const getLikeCount = async(req,res)=>{
  try {
    const videoId = parseInt(req.params.videoId);
    const likeCount = await prisma.like.count({where:{videoId:videoId}});
    return res.status(200).json({likeCount});
  } catch (error) {
    return res.status(500).json({error:error.message});
  }
}

const isLiked = async(req,res)=>{
  try {
    const videoId = parseInt(req.params.videoId);
    const userId = req.user.id;
    const likedOrNot = await prisma.like.findUnique({where:{
      userId_videoId:{
        videoId:videoId,
        userId:userId
      }
    }})
    if(likedOrNot){
      return res.status(200).json({liked:true, likedOrNot});
    } else {
      return res.status(200).json({liked:false, likedOrNot});
    }
    

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({error});
  }
}


const getLikedVideos = async(req,res)=>{
  try {
    const user = req.user;
    if(!user){
      return res.status(401).json({message:"Must log in to get liked videos"});
    }
    const likedVideos = await prisma.like.findMany({
      where:{
        userId:user.id
      },
      include:{
        video:{
          include:{
            user:{select:{id:true, firstname:true, lastname:true}},
            _count:{
              select:{
                likes:true,
                comments:true
              }
            }
          }
        }
      }
    });
    return res.status(200).json({likedVideos});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({error});
  }
}

export { likeVideo, getLikeCount, isLiked, getLikedVideos };
