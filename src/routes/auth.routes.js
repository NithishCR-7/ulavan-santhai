import { Router } from 'express';
import {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
} from '../controllers/auth.controller.js';

const router = Router();

// Route 1: Register User & Dispatch Verification OTP
// Endpoints: POST /api/auth/register & POST /api/v1/auth/register
router.post('/register', register);

// Route 2: Verify 6-Digit Email OTP to Activate Account & Save to Supabase
// Endpoints: POST /api/auth/email/verify & POST /api/v1/auth/email/verify
router.post('/email/verify', verifyEmailOtp);
router.post('/verify', verifyEmailOtp);

// Route 3: Resend Fresh 6-Digit Verification OTP (with 30s Cooldown)
// Endpoints: POST /api/auth/email/resend & POST /api/v1/auth/email/resend
router.post('/email/resend', resendEmailOtp);
router.post('/resend', resendEmailOtp);

// Route 4: User Login (Checks Supabase Database & Verifies Credentials)
// Endpoints: POST /api/auth/login & POST /api/v1/auth/login
router.post('/login', login);

export default router;
