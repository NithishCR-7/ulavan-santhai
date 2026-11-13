import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { processPayment } from '../controllers/payment.controller.js';

const router = Router();

// Route: Record Platform Payment - Gate 1 Protected
// Endpoints: POST /api/v1/payments & POST /api/payments
router.post('/', verifyToken, processPayment);
router.post('/payment', verifyToken, processPayment);

export default router;

