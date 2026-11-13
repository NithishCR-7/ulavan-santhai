import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadDocument } from '../controllers/document.controller.js';

const router = Router();

// Route 1: Document Upload (KYC, Bank Passbook, Farm Proof)
// Endpoints: POST /api/v1/documents/upload & POST /api/documents/upload
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);

export default router;

