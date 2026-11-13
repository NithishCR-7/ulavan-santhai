import * as onboardingService from '../services/onboarding.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Get live user onboarding status (Gate 2 Guarded)
 * @route GET /api/v1/user/me
 */
export const getMe = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);
    const result = await onboardingService.getUserStatusService(authUser.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch user onboarding status.',
    });
  }
};
