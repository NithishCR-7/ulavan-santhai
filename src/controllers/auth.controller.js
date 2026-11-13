import * as authService from '../services/auth.service.js';

/**
 * Controller: Register User & Dispatch Verification OTP
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUserService(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
};

/**
 * Controller: Verify 6-Digit Email OTP to Activate Account & Save to Supabase
 * @route   POST /api/auth/email/verify
 */
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyEmailOtpService(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'OTP verification failed.',
    });
  }
};

/**
 * Controller: Resend 6-Digit Email OTP
 * @route   POST /api/auth/email/resend
 */
export const resendEmailOtp = async (req, res, next) => {
  try {
    const result = await authService.resendEmailOtpService(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Resending verification code failed.',
    });
  }
};

/**
 * Controller: User Login (Checks Supabase Database & Credentials)
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUserService(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Login failed.',
    });
  }
};
