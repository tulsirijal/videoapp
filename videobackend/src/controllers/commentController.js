import prisma from "../db/prisma.js";
import { sendNotification } from "../services/notificationEmitter.js";
import { getIo } from "../services/socketStore.js";



const comment = async (req, res) => {
  try {
    const io = getIo(); 
    const user = req.user;
    const { commentText, parentId } = req.body; // Receive parentId from frontend
    const videoId = parseInt(req.params.videoId);

    const uploadComment = await prisma.comment.create({
      data: { 
        commentText, 
        userId: user.id, 
        videoId,
        parentId: parentId ? parseInt(parentId) : null 
      },
      include: { user: true },
    });

    io.to(`comments_${videoId}`).emit("new_comment", uploadComment);
    // Send notification to the video owner
    const video = await prisma.video.findUnique({where:{id:videoId}});
    if(video.userId != user.id){
      await sendNotification({
        receiverId:video.userId,
        senderId:user.id,
        type:"COMMENT",
        videoId:video.id
      })
    }

    if(parentId){
      // It's a reply, fetch the parent comment
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        include: { user: true }
      });
      if(parentComment && parentComment.userId != user.id){
        // Send notification to the parent comment owner
        await sendNotification({
          receiverId:parentComment.userId,
          senderId:user.id,
          type:"REPLY",
          videoId:video.id
        })
      }  
    }
    return res.status(200).json(uploadComment);
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const getComment = async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);

    const comments = await prisma.comment.findMany({
      where: { 
        videoId: videoId,
        parentId: null // Only fetch top-level comments first
      },
      include: {
        user: true,
        replies: {
          include: { user: true } // Include user info for replies
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};


const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Must log in to comment" });
    }
    const commentId = parseInt(req.params.commentId);
    const deleteCom = await prisma.comment.deleteMany({ where: { id: commentId, userId: user.id } });

    return res.status(200).json(deleteCom);
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error}` });
  }
};


export { deleteComment, comment, getComment };
