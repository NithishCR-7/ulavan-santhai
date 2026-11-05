/**
 * Ulavan Santhai - Payment & Admin Review API Service
 * Task 8: Registration, Payment and Approval Flow Integration.
 * Implements configurable pricing, payment records, gateway contract, and admin verification.
 */

import { apiFetch } from "./apiConfig";

export const PAYMENT_STORAGE_KEY = "ulavan_payments";
export const ADMIN_REVIEWS_STORAGE_KEY = "ulavan_admin_payment_reviews";

/**
 * Configurable Role-Based Pricing Plans
 */
export const PRICING_PLANS = {
  BUYER: {
    id: "plan_buyer_base",
    role: "BUYER",
    name: "Buyer Verified Access Plan",
    basePrice: 365,
    taxAmount: 0, // Agricultural marketplace exemption / all-inclusive
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
    taxAmount: 0, // All-inclusive
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
 * Seed initial sample payment review requests for admin audit trail
 */
const SEED_PAYMENTS = [
  {
    id: "pay_sample_101",
    transactionId: "TXN_US_98241289",
    gatewayReference: "GW_RZP_9824128911",
    invoiceNumber: "INV-US-2026-00412",
    userId: "USR_RAMESH_9824",
    userName: "Farmer Ramesh Kumar",
    userEmail: "ramesh@ulavansanthai.in",
    userMobile: "9876543210",
    role: "SELLER",
    planId: "plan_seller_monthly",
    planName: "Seller Platform Membership (₹365/mo)",
    baseAmount: 365,
    taxAmount: 0,
    totalAmount: 365,
    paymentMethod: "UPI",
    paymentDetails: { upiVpa: "ramesh.farmer@okhdfcbank" },
    paymentStatus: "APPROVED", // PENDING | APPROVED | REJECTED | FAILED
    paymentDate: "2026-11-04T10:30:00.000Z",
    planStartDate: "2026-11-04T10:30:00.000Z",
    planEndDate: "2026-12-04T10:30:00.000Z",
    renewalDueDate: "2026-12-04T10:30:00.000Z",
    adminReview: {
      reviewStatus: "APPROVED",
      reviewedBy: "Admin Senthil (Officer #04)",
      reviewedAt: "2026-11-04T11:15:00.000Z",
      remarks: "UPI bank reference matched with HDFC settlement report.",
      refundFlag: false,
    },
  },
];

const SEED_REVIEWS = [
  {
    id: "rev_sample_101",
    paymentId: "pay_sample_101",
    transactionId: "TXN_US_98241289",
    gatewayReference: "GW_RZP_9824128911",
    userId: "USR_RAMESH_9824",
    userName: "Farmer Ramesh Kumar",
    userEmail: "ramesh@ulavansanthai.in",
    userMobile: "9876543210",
    role: "SELLER",
    amount: 365,
    paymentMethod: "UPI",
    submittedAt: "2026-11-04T10:30:00.000Z",
    reviewStatus: "APPROVED",
    reviewedBy: "Admin Senthil (Officer #04)",
    reviewedAt: "2026-11-04T11:15:00.000Z",
    remarks: "UPI bank reference matched with settlement report.",
    refundFlag: false,
  },
];

/**
 * Get all stored payments from browser storage
 */
export function getLocalStoredPayments() {
  if (typeof window === "undefined") return SEED_PAYMENTS;
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(SEED_PAYMENTS));
      return SEED_PAYMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_PAYMENTS;
  } catch (err) {
    console.error("[PaymentApi] Error reading payments from storage:", err);
    return SEED_PAYMENTS;
  }
}

/**
 * Save payments to storage
 */
export function setLocalStoredPayments(payments) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error("[PaymentApi] Error saving payments:", err);
  }
}

/**
 * Get all admin payment reviews from storage
 */
export function getLocalStoredReviews() {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(ADMIN_REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_REVIEWS;
  } catch (err) {
    console.error("[PaymentApi] Error reading reviews from storage:", err);
    return SEED_REVIEWS;
  }
}

/**
 * Save admin payment reviews
 */
export function setLocalStoredReviews(reviews) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error("[PaymentApi] Error saving reviews:", err);
  }
}

/**
 * STAGE 4: Process and Record Role Payment Checkout
 */
export async function submitRolePayment(checkoutData) {
  const role = (checkoutData.role || "BUYER").toUpperCase();
  const plan = PRICING_PLANS[role] || PRICING_PLANS.BUYER;

  const now = new Date();
  const nowIso = now.toISOString();

  // End date calculation
  const endDate = new Date(now);
  if (role === "SELLER") {
    endDate.setDate(endDate.getDate() + 30); // 30-day monthly cycle
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1); // 1-year buyer access
  }

  const txId = checkoutData.transactionId || `TXN_US_${Date.now().toString().slice(-8)}`;
  const gwRef = checkoutData.gatewayReference || `GW_${checkoutData.paymentMethod?.toUpperCase() || "PAY"}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const invNumber = `INV-US-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const paymentRecord = {
    id: `pay_${Date.now()}`,
    transactionId: txId,
    gatewayReference: gwRef,
    invoiceNumber: invNumber,
    userId: checkoutData.userId || `USR_${Date.now().toString().slice(-6)}`,
    userName: checkoutData.userName || "Verified User",
    userEmail: checkoutData.userEmail || "user@example.com",
    userMobile: checkoutData.userMobile || "9876543210",
    role: role,
    planId: plan.id,
    planName: plan.name,
    baseAmount: plan.basePrice,
    taxAmount: plan.taxAmount,
    totalAmount: plan.totalAmount,
    currency: plan.currency,
    paymentMethod: checkoutData.paymentMethod || "UPI",
    paymentDetails: checkoutData.paymentDetails || {},
    paymentStatus: "PENDING", // Initial status awaiting admin review
    paymentDate: nowIso,
    planStartDate: nowIso,
    planEndDate: endDate.toISOString(),
    renewalDueDate: endDate.toISOString(),
    // Buyer specific access limit tracking
    buyerContactLimit: role === "BUYER" ? plan.initialContactLimit : null,
    buyerContactsViewed: 0,
    buyerContactsRemaining: role === "BUYER" ? plan.initialContactLimit : null,
    adminReview: {
      reviewStatus: "PENDING_REVIEW",
      reviewedBy: null,
      reviewedAt: null,
      remarks: "Payment received. Queued for admin verification.",
      refundFlag: false,
    },
  };

  // Create corresponding Admin Review Request
  const reviewRequest = {
    id: `rev_${Date.now()}`,
    paymentId: paymentRecord.id,
    transactionId: txId,
    gatewayReference: gwRef,
    invoiceNumber: invNumber,
    userId: paymentRecord.userId,
    userName: paymentRecord.userName,
    userEmail: paymentRecord.userEmail,
    userMobile: paymentRecord.userMobile,
    role: role,
    planName: plan.name,
    amount: plan.totalAmount,
    paymentMethod: checkoutData.paymentMethod || "UPI",
    paymentDetails: checkoutData.paymentDetails || {},
    submittedAt: nowIso,
    reviewStatus: "PENDING_REVIEW",
    reviewedBy: null,
    reviewedAt: null,
    remarks: "Awaiting bank statement reconciliation.",
    refundFlag: false,
  };

  // Dispatch to backend API
  const apiRes = await apiFetch(
    "/api/v1/payments",
    {
      method: "POST",
      body: JSON.stringify({ paymentRecord, reviewRequest }),
    },
    paymentRecord
  );

  // Synchronize local persistent storage
  const existingPayments = getLocalStoredPayments();
  const updatedPayments = [paymentRecord, ...existingPayments];
  setLocalStoredPayments(updatedPayments);

  const existingReviews = getLocalStoredReviews();
  const updatedReviews = [reviewRequest, ...existingReviews];
  setLocalStoredReviews(updatedReviews);

  // Update session
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("ulavan_user") || localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = {
          ...parsed,
          activeRole: role,
          pendingPaymentId: paymentRecord.id,
          pendingTransactionId: txId,
          [`isPaid_${role}`]: false, // Not yet activated until admin approval
          [`paymentStatus_${role}`]: "PENDING_REVIEW",
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updated));
        sessionStorage.setItem("ulavan_latest_payment_id", paymentRecord.id);
        sessionStorage.setItem("ulavan_latest_tx_id", txId);
      }
    } catch (err) {
      console.error("[PaymentApi] Error updating session:", err);
    }
  }

  return {
    success: true,
    data: paymentRecord,
    isMock: apiRes.isMock,
    source: apiRes.source,
  };
}

/**
 * Fetch all admin review requests with optional filter
 */
export async function getAdminPaymentReviews(statusFilter = "ALL") {
  const localReviews = getLocalStoredReviews();
  const filtered = localReviews.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.reviewStatus === statusFilter;
  });

  const res = await apiFetch(
    `/api/v1/admin/payments?status=${statusFilter}`,
    { method: "GET" },
    filtered
  );

  return {
    success: true,
    data: res.data || filtered,
    isMock: res.isMock,
  };
}

/**
 * STAGE 5: Admin Approves Payment Review
 */
export async function approvePaymentReview(reviewId, remarks = "", reviewerName = "Admin Officer") {
  const nowIso = new Date().toISOString();
  const reviews = getLocalStoredReviews();
  const payments = getLocalStoredPayments();

  let targetReview = null;
  const updatedReviews = reviews.map((r) => {
    if (r.id === reviewId) {
      targetReview = {
        ...r,
        reviewStatus: "APPROVED",
        reviewedBy: reviewerName,
        reviewedAt: nowIso,
        remarks: remarks || "Payment reconciled and verified against bank gateway logs.",
        refundFlag: false,
      };
      return targetReview;
    }
    return r;
  });

  if (!targetReview) {
    return { success: false, error: "Review request not found." };
  }

  // Update corresponding payment record
  let targetPayment = null;
  const updatedPayments = payments.map((p) => {
    if (p.id === targetReview.paymentId || p.transactionId === targetReview.transactionId) {
      targetPayment = {
        ...p,
        paymentStatus: "APPROVED",
        adminReview: {
          reviewStatus: "APPROVED",
          reviewedBy: reviewerName,
          reviewedAt: nowIso,
          remarks: remarks || "Payment reconciled and verified against bank gateway logs.",
          refundFlag: false,
        },
      };
      return targetPayment;
    }
    return p;
  });

  // Save changes locally
  setLocalStoredReviews(updatedReviews);
  setLocalStoredPayments(updatedPayments);

  // Update user session to unlock Stage 5B (Business Category and Detailed Onboarding)
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("ulavan_user") || localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const role = targetReview.role;
        const updated = {
          ...parsed,
          [`isPaid_${role}`]: true,
          [`paymentStatus_${role}`]: "APPROVED",
          isPaid: true,
          status: "active",
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updated));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updated));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("[PaymentApi] Error updating session on approval:", err);
    }
  }

  // Dispatch to backend API
  const apiRes = await apiFetch(
    `/api/v1/admin/payments/${reviewId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ reviewId, remarks, reviewerName }),
    },
    targetReview
  );

  return {
    success: true,
    data: { review: targetReview, payment: targetPayment },
    isMock: apiRes.isMock,
  };
}

/**
 * STAGE 5: Admin Rejects Payment Review
 */
export async function rejectPaymentReview(reviewId, rejectionReason = "Reference mismatch", reviewerName = "Admin Officer") {
  const nowIso = new Date().toISOString();
  const reviews = getLocalStoredReviews();
  const payments = getLocalStoredPayments();

  let targetReview = null;
  const updatedReviews = reviews.map((r) => {
    if (r.id === reviewId) {
      targetReview = {
        ...r,
        reviewStatus: "REJECTED",
        reviewedBy: reviewerName,
        reviewedAt: nowIso,
        remarks: rejectionReason,
        refundFlag: true,
      };
      return targetReview;
    }
    return r;
  });

  if (!targetReview) {
    return { success: false, error: "Review request not found." };
  }

  // Update payment record
  let targetPayment = null;
  const updatedPayments = payments.map((p) => {
    if (p.id === targetReview.paymentId || p.transactionId === targetReview.transactionId) {
      targetPayment = {
        ...p,
        paymentStatus: "REJECTED",
        adminReview: {
          reviewStatus: "REJECTED",
          reviewedBy: reviewerName,
          reviewedAt: nowIso,
          remarks: rejectionReason,
          refundFlag: true,
        },
      };
      return targetPayment;
    }
    return p;
  });

  setLocalStoredReviews(updatedReviews);
  setLocalStoredPayments(updatedPayments);

  // Update user session
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("ulavan_user") || localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const role = targetReview.role;
        const updated = {
          ...parsed,
          [`isPaid_${role}`]: false,
          [`paymentStatus_${role}`]: "REJECTED",
          [`rejectionReason_${role}`]: rejectionReason,
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("[PaymentApi] Error updating session on rejection:", err);
    }
  }

  const apiRes = await apiFetch(
    `/api/v1/admin/payments/${reviewId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reviewId, rejectionReason, reviewerName }),
    },
    targetReview
  );

  return {
    success: true,
    data: { review: targetReview, payment: targetPayment },
    isMock: apiRes.isMock,
  };
}

/**
 * Check if the active user's role has an approved payment
 */
export function checkRolePaymentStatus(role) {
  if (typeof window === "undefined") return { approved: false, status: "NONE" };
  try {
    const raw = sessionStorage.getItem("ulavan_user") || localStorage.getItem("ulavan_registered_user");
    if (!raw) return { approved: false, status: "NONE" };
    const user = JSON.parse(raw);
    const targetRole = (role || user.role || "BUYER").toUpperCase();

    if (user[`isPaid_${targetRole}`] === true || user[`paymentStatus_${targetRole}`] === "APPROVED") {
      return { approved: true, status: "APPROVED" };
    }
    if (user[`paymentStatus_${targetRole}`] === "PENDING_REVIEW") {
      return { approved: false, status: "PENDING_REVIEW" };
    }
    if (user[`paymentStatus_${targetRole}`] === "REJECTED") {
      return { approved: false, status: "REJECTED", reason: user[`rejectionReason_${targetRole}`] };
    }

    // Check payments list directly
    const payments = getLocalStoredPayments();
    const match = payments.find((p) => p.role === targetRole && (p.userId === user.id || p.userEmail === user.email));
    if (match) {
      return {
        approved: match.paymentStatus === "APPROVED",
        status: match.paymentStatus,
        paymentRecord: match,
      };
    }
  } catch (err) {
    console.error("[PaymentApi] Error checking role payment status:", err);
  }
  return { approved: false, status: "NONE" };
}
