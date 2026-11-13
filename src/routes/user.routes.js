import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getMe } from '../controllers/user.controller.js';

const router = Router();

// Route: Live check of user onboarding status
// Endpoints: GET /api/v1/user/me & GET /api/user/me
router.get('/me', verifyToken, getMe);

export default router;

