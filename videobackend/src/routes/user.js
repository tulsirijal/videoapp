import express from 'express';
import { getAllUser, getChannelInfoWithVideos, getUserById, getUserInfo } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/getUser/:id', getUserById);
router.get('/getUsers', getAllUser);
router.get('/getUserInfo/:channelId',getUserInfo);
router.get('/getChannelInfoWithVideos/:id', getChannelInfoWithVideos);
export default router