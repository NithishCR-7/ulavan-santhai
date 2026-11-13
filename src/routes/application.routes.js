import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  submitApplication,
  getApplicationStatus,
} from '../controllers/application.controller.js';

const router = Router();

// Route: Final Onboarding Submission (Buyer & Seller) - Gate 1 Protected
// Endpoints: POST /api/v1/applications/submit & POST /api/applications/submit
router.post('/submit', verifyToken, submitApplication);

// Route: Application Status Tracking - Gate 1 Protected
// Endpoints: GET /api/v1/applications/status & GET /api/applications/status
router.get('/status', verifyToken, getApplicationStatus);

export default router;

