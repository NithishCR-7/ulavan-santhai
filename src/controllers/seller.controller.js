import * as onboardingService from '../services/onboarding.service.js';
import { assertAuthorized } from '../utils/authGuard.js';

/**
 * Controller: Get Seller Dashboard (Gate 2 Guarded)
 * @route GET /api/v1/seller/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and assert Seller onboarding authorization
    const authUser = await assertAuthorized(req, {
      requireSellerOnboarded: true,
    });

    const result = await onboardingService.getSellerDashboardService(authUser.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to load seller dashboard.',
    });
  }
};
