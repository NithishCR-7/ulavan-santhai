import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { onboardSeller, onboardBuyer } from '../controllers/onboarding.controller.js';
import { processPayment } from '../controllers/payment.controller.js';

const router = Router();

// Route 1: Seller Onboarding - Gate 1 Protected
// Endpoints: POST /api/v1/onboarding/seller & POST /api/onboarding/seller
router.post('/seller', verifyToken, onboardSeller);

// Route 2: Buyer Onboarding - Gate 1 Protected
// Endpoints: POST /api/v1/onboarding/buyer & POST /api/onboarding/buyer
router.post('/buyer', verifyToken, onboardBuyer);

// Route 3: Membership Payment (if called via /onboarding/payment) - Gate 1 Protected
// Endpoints: POST /api/v1/onboarding/payment & POST /api/onboarding/payment
router.post('/payment', verifyToken, processPayment);

export default router;
