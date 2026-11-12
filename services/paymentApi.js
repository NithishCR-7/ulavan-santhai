/**
 * Ulavan Santhai - Payment & Admin Review API Service
 * Strictly communicates with backend API (/api/v1/payments).
 * No mock data, no static fallback arrays.
 */

import { apiFetch } from "./apiConfig";

/**
 * Configurable Role-Based Pricing Plans (metadata for UI display)
 */
export const PRICING_PLANS = {
  BUYER: {
    id: "plan_buyer_base",
    role: "BUYER",
    name: "Buyer Verified Access Plan",
    basePrice: 365,
    taxAmount: 0,
    totalAmount: 365,
    currency: "INR",
    billingCycle: "Annual Access",
    initialContactLimit: 10,
    topUpRate: 10,
    topUpBlock: 10,
    description: "Unlock up to 10 verified agricultural producers with direct contact details. Additional unlocks at ₹10 for 10 producers.",
    benefits: [
      "View up to 10 verified farmer/seller contacts",
      "Direct call and WhatsApp access to cultivators",
      "Send unlimited direct purchase enquiries",
      "Zero middleman brokerage or procurement commission",
      "Top-up anytime at ₹10 per 10 additional producers",
    ],
  },
  SELLER: {
    id: "plan_seller_monthly",
    role: "SELLER",
    name: "Seller Platform Membership",
    basePrice: 365,
    taxAmount: 0,
    totalAmount: 365,
    currency: "INR",
    billingCycle: "Per Month",
    renewalPeriodDays: 30,
    description: "Showcase agricultural harvest lots, receive verified commercial buyer enquiries, and access fair-trade market tools.",
    benefits: [
      "List and showcase unlimited agricultural crop lots",
      "Prominent verified producer listing badge",
      "Receive direct buyer enquiries and request for quotes",
      "Zero commission on all farm-gate transactions",
      "Direct farmer-to-buyer transparent communication",
    ],
  },
};

/**
 * Record a payment checkout transaction strictly on backend
 */
export async function recordPaymentCheckout(checkoutData) {
  const role = checkoutData.role || "BUYER";
  const plan = PRICING_PLANS[role] || PRICING_PLANS.BUYER;
  const txId = checkoutData.transactionId || `TXN_US_${Date.now()}`;

  const payload = {
    transactionId: txId,
    role,
    amount: plan.totalAmount,
    paymentMethod: checkoutData.paymentMethod || "UPI",
    paymentDetails: checkoutData.paymentDetails || {},
    planName: plan.name,
  };

  return apiFetch("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Submit role payment helper (alias for recordPaymentCheckout)
 */
export async function submitRolePayment(role, paymentDetails = {}) {
  return recordPaymentCheckout({ role, ...paymentDetails });
}

/**
 * Get user payment history strictly from backend
 */
export async function getPaymentHistory() {
  const res = await apiFetch("/api/v1/payments/history", { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }
  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch payment history.",
  };
}

/**
 * Get pending payments for admin review strictly from backend
 */
export async function getAdminPendingPayments() {
  const res = await apiFetch("/api/v1/admin/payments/review", { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }
  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch pending reviews.",
  };
}

/**
 * Admin approves payment strictly on backend
 */
export async function adminApprovePayment(paymentId, reviewDetails = {}) {
  return apiFetch(`/api/v1/admin/payments/${encodeURIComponent(paymentId)}/approve`, {
    method: "POST",
    body: JSON.stringify(reviewDetails),
  });
}

/**
 * Admin rejects payment strictly on backend
 */
export async function adminRejectPayment(paymentId, rejectionDetails = {}) {
  return apiFetch(`/api/v1/admin/payments/${encodeURIComponent(paymentId)}/reject`, {
    method: "POST",
    body: JSON.stringify(rejectionDetails),
  });
}

/**
 * Verify payment status strictly on backend
 */
export async function verifyPayment(paymentId) {
  return apiFetch(`/api/v1/payments/${encodeURIComponent(paymentId)}/verify`, {
    method: "GET",
  });
}

/**
 * Local stored payments helper
 */
export function getLocalStoredPayments() {
  return [];
}
