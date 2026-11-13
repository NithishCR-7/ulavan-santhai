import * as onboardingService from '../services/onboarding.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Submit Seller Onboarding (Gate 2 Guarded)
 * @route POST /api/v1/onboarding/seller
 */
export const onboardSeller = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);
    const result = await onboardingService.onboardSellerService(authUser.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Seller onboarding failed.',
    });
  }
};

/**
 * Controller: Submit Buyer Onboarding (Gate 2 Guarded)
 * @route POST /api/v1/onboarding/buyer
 */
export const onboardBuyer = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);
    const result = await onboardingService.onboardBuyerService(authUser.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Buyer onboarding failed.',
    });
  }
};
