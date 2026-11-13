import * as paymentService from '../services/payment.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Record Payment (Gate 2 Guarded)
 * @route POST /api/v1/payments & POST /api/payments
 */
export const processPayment = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await paymentService.processPaymentService({
      ...req.body,
      userId: authUser.id,
      user: authUser,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Payment processing failed.',
    });
  }
};
