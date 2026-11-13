import crypto from 'node:crypto';
import * as paymentRepository from '../repositories/payment.repository.js';
import * as userRepository from '../repositories/user.repository.js';

/**
 * Service: Process & Record Payment
 */
export const processPaymentService = async ({
  paymentRecord = {},
  reviewRequest = {},
  userId: directUserId,
  transactionId: directTxnId,
  amount: directAmount,
  role: directRole,
  plan: directPlan,
  paymentMethod: directMethod,
  user,
} = {}) => {
  const userId = user?.id;

  if (!userId) {
    const error = new Error('User authentication required for payment. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  const paymentId =
    paymentRecord.id ||
    reviewRequest.paymentId ||
    `PAY_${crypto.randomInt(100000, 999999)}`;

  const transactionId =
    paymentRecord.transactionId ||
    reviewRequest.transactionId ||
    directTxnId ||
    `TXN_${crypto.randomInt(100000, 999999)}`;

  const rawAmount =
    paymentRecord.totalAmount ||
    paymentRecord.baseAmount ||
    reviewRequest.amount ||
    directAmount ||
    365.0;

  const numericAmount = parseFloat(rawAmount).toFixed(2);
  const normalizedRole = String(
    paymentRecord.role || reviewRequest.role || directRole || 'BUYER'
  ).toUpperCase();

  const plan = String(
    paymentRecord.planName ||
      paymentRecord.planId ||
      reviewRequest.planName ||
      directPlan ||
      'Verified Membership Plan'
  ).slice(0, 100);

  const paymentMethod = String(
    paymentRecord.paymentMethod ||
      reviewRequest.paymentMethod ||
      directMethod ||
      'UPI'
  ).slice(0, 50);

  const status = String(
    paymentRecord.paymentStatus || reviewRequest.reviewStatus || 'CONFIRMED'
  ).slice(0, 30);

  const savedPayment = await paymentRepository.create({
    id: paymentId,
    userId,
    transactionId,
    amount: numericAmount,
    role: normalizedRole,
    paymentMethod,
    plan,
    status,
    paidAt: new Date(),
  });

  console.log(`[PAYMENT] Recorded payment ${savedPayment.id} for user ${userId}: amount=${numericAmount}`);

  return {
    success: true,
    message: 'Payment recorded successfully.',
    payment: {
      id: savedPayment.id,
      transactionId: savedPayment.transactionId,
      amount: savedPayment.amount,
      plan: savedPayment.plan,
      role: savedPayment.role,
      status: savedPayment.status,
      paidAt: savedPayment.paidAt,
    },
  };
};

