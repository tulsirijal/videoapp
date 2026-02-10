import express from 'express';
import { register, login, refresh, getMe, logout} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

export default router;