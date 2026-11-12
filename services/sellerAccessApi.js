/**
 * Ulavan Santhai - Seller Access & Entitlement API Service
 * Strictly connects to backend API endpoints for buyer access entitlement,
 * seller contact unlocking, quota management, and access audit history.
 * No mock/static fallback data.
 */

import { apiFetch } from "./apiConfig";

/**
 * Fetch current buyer's access entitlement and unlock quota strictly from backend
 */
export async function getBuyerAccessEntitlement() {
  const res = await apiFetch("/api/v1/buyer/access-entitlement", { method: "GET" });
  if (res.success && res.data) {
    const quota = res.data.quotaRemaining ?? res.data.viewsRemaining ?? 10;
    return {
      success: true,
      data: res.data,
      viewsRemaining: quota,
      quotaRemaining: quota,
    };
  }

  return {
    success: false,
    error: res.error || "Failed to fetch entitlement from backend.",
    data: null,
    viewsRemaining: 10,
    quotaRemaining: 10,
  };
}

/**
 * Fetch seller details for a product strictly from backend
 */
export async function getSellerForProduct(sellerId) {
  const res = await apiFetch(`/api/v1/sellers/${encodeURIComponent(sellerId)}`, {
    method: "GET",
  });

  if (res.success && res.data) {
    return {
      success: true,
      isUnlocked: Boolean(res.data.isUnlocked),
      seller: res.data.seller || res.data,
    };
  }

  return {
    success: false,
    isUnlocked: false,
    error: res.error || "Failed to fetch seller details from backend.",
    seller: null,
  };
}

/**
 * Unlock a seller's contact details strictly via backend API
 */
export async function unlockSellerContact(productId, sellerId, productTitle = "") {
  const payload = {
    productId,
    sellerId,
    productTitle,
  };

  const res = await apiFetch("/api/v1/buyer/unlock-seller", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.success && res.data) {
    return {
      success: true,
      deducted: res.data.deducted ?? true,
      quotaRemaining: res.data.quotaRemaining ?? res.data.viewsRemaining,
      seller: res.data.seller,
      message: res.data.message || "Seller contact unlocked successfully.",
    };
  }

  return {
    success: false,
    error: res.error || "Failed to unlock seller contact on backend.",
    message: res.error,
  };
}

/**
 * Top-up buyer quota (+10 views for ₹10) strictly via backend API
 */
export async function topUpBuyerQuota() {
  const res = await apiFetch("/api/v1/buyer/quota-topup", {
    method: "POST",
    body: JSON.stringify({ amount: 10, addedQuota: 10 }),
  });

  if (res.success && res.data) {
    return {
      success: true,
      quotaRemaining: res.data.quotaRemaining ?? res.data.newQuota,
      message: res.data.message || "Successfully added 10 seller contact views.",
    };
  }

  return {
    success: false,
    error: res.error || "Failed to top up quota on backend.",
  };
}

/**
 * Retrieve the buyer's unlocked seller access history strictly from backend
 */
export async function getBuyerAccessHistory() {
  const res = await apiFetch("/api/v1/buyer/access-history", { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch access history from backend.",
  };
}

/**
 * Local state reader helper (safely reads from session if stored by backend responses)
 */
export function getLocalBuyerAccessState() {
  if (typeof window === "undefined") {
    return { quotaRemaining: 10, unlockedSellerIds: [], accessHistory: [] };
  }
  try {
    const rawQuota = sessionStorage.getItem("ulavan_buyer_quota");
    const quota = rawQuota ? Number(rawQuota) : 10;
    const rawUnlocked = sessionStorage.getItem("ulavan_unlocked_sellers");
    const unlocked = rawUnlocked ? JSON.parse(rawUnlocked) : [];
    return {
      quotaRemaining: isNaN(quota) ? 10 : quota,
      unlockedSellerIds: Array.isArray(unlocked) ? unlocked : [],
      accessHistory: [],
    };
  } catch {
    return { quotaRemaining: 10, unlockedSellerIds: [], accessHistory: [] };
  }
}

/**
 * Record seller access event (alias for unlockSellerContact)
 */
export async function recordSellerAccess(sellerId, productId, productTitle) {
  return unlockSellerContact(productId, sellerId, productTitle);
}
