import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getMarketplace } from '../controllers/buyer.controller.js';

const router = Router();

// Route: Protected Buyer Marketplace
// Endpoints: GET /api/v1/buyer/marketplace & GET /api/buyer/marketplace
router.get('/marketplace', verifyToken, getMarketplace);

export default router;

