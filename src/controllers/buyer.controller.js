import * as onboardingService from '../services/onboarding.service.js';
import { assertAuthorized } from '../utils/authGuard.js';

/**
 * Controller: Get Buyer Marketplace (Gate 2 Guarded)
 * @route GET /api/v1/buyer/marketplace
 */
export const getMarketplace = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and assert Buyer onboarding authorization
    const authUser = await assertAuthorized(req, {
      requireBuyerOnboarded: true,
    });

    const result = await onboardingService.getBuyerMarketplaceService(authUser.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to load buyer marketplace.',
    });
  }
};
