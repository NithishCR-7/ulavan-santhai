import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getDashboard } from '../controllers/seller.controller.js';

const router = Router();

// Route: Protected Seller Dashboard
// Endpoints: GET /api/v1/seller/dashboard & GET /api/seller/dashboard
router.get('/dashboard', verifyToken, getDashboard);

export default router;

