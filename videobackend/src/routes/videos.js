import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addViews, editVideo, getAllVideos, getTotalViews, getVideo, removeVideo,searchVideos,videoUpload} from "../controllers/videosController.js";
import upload from "../middleware/multer.js";
import { comment, deleteComment, getComment } from "../controllers/commentController.js";
import { getLikeCount, getLikedVideos, isLiked, likeVideo } from "../controllers/likeController.js";
import subscribe, { getAllSubscribers, getAllSubscriptions, isSubscribed } from "../controllers/subscribeController.js";
import { addToWatchLater, getWatchLater, removeFromWatchLater } from "../controllers/videoWatchLater.js";
import { addHistory, deleteAllHistory, deleteHistory, getHistory } from "../controllers/historyController.js";
import { getStudioAnalytics } from "../controllers/studioStatsController.js";
import { generateDescription } from "../controllers/aiController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/uploadVideo", authMiddleware, upload.single("videoFile"), videoUpload);
router.post("/removeVideo/:videoId",authMiddleware,removeVideo);
router.get("/videos",getAllVideos);
router.get("/video/:id",getVideo);
router.post("/editVideo/:videoId", authMiddleware, editVideo);

router.post("/uploadComment/:videoId", authMiddleware, rateLimiter(1,60),comment);
router.post("/deleteComment/:commentId", authMiddleware, deleteComment);
router.get("/getComment/:videoId", getComment);

router.post("/likeVideo/:videoId", authMiddleware, likeVideo);
router.get('/isLiked/:videoId', authMiddleware, isLiked);
router.get('/getLikeCount/:videoId', getLikeCount);
router.get('/likedVideos', authMiddleware, getLikedVideos);


router.post('/subscribe/:channelId', authMiddleware, subscribe);
router.get('/getSubscriber/:channelId',getAllSubscribers );
router.post('/isSubscribed', authMiddleware, isSubscribed);
router.get('/getSubscriptions', authMiddleware, getAllSubscriptions);

router.post("/addViews/:videoId", authMiddleware, addViews);
router.get("/getViews/:videoId", getTotalViews);

router.post("/search", searchVideos);

router.post("/addHistory/:videoId", authMiddleware, addHistory);
router.get("/getHistory", authMiddleware, getHistory);
router.post("/deleteHistory/:historyId", authMiddleware, deleteHistory);
router.post("/deleteAllHistory", authMiddleware, deleteAllHistory);


router.get('/getWatchLater', authMiddleware, getWatchLater);
router.post('/addToWatchLater/:videoId', authMiddleware, addToWatchLater);
router.post('/removeFromWatchLater/:videoId', authMiddleware, removeFromWatchLater);


router.get('/studioStats', authMiddleware, getStudioAnalytics);

router.post('/generateDescription', generateDescription);

export default router;
