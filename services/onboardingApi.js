/**
 * Ulavan Santhai - Onboarding API Service
 * Centralized API integration layer for all onboarding operations.
 * Communicates strictly with backend endpoints (/api/v1/...) via Next.js proxy.
 * No mock/contract fallbacks: strictly returns real backend results.
 */

import { apiFetch } from "./apiConfig";

// Retrieve authorization header token securely from session
export function getAuthHeaders(isMultipart = false) {
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token =
      sessionStorage.getItem("ulavan_auth_token") ||
      localStorage.getItem("ulavan_auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * STEP 1: Save User Role
 * POST /api/v1/onboarding/role
 * @param {'BUYER' | 'SELLER' | 'BOTH'} roleInput
 */
export async function saveRole(roleInput) {
  const payload = typeof roleInput === "string" ? { role: roleInput } : roleInput;
  return apiFetch("/api/v1/onboarding/role", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * STEP 2: Save Account Category
 * POST /api/v1/onboarding/category
 * @param {'INDIVIDUAL' | 'BUSINESS'} category
 */
export async function saveCategory(category) {
  return apiFetch("/api/v1/onboarding/category", {
    method: "POST",
    body: JSON.stringify({ category }),
  });
}

/**
 * STEP 3A: Save Buyer Profile
 * POST /api/v1/onboarding/buyer-profile
 */
export async function saveBuyerProfile(profileData) {
  return apiFetch("/api/v1/onboarding/buyer-profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

/**
 * STEP 3B: Save Seller Profile
 * POST /api/v1/onboarding/seller-profile
 */
export async function saveSellerProfile(profileData) {
  return apiFetch("/api/v1/onboarding/seller-profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

/**
 * STEP 3C: Save Business Profile
 * POST /api/v1/onboarding/business-profile
 */
export async function saveBusinessProfile(businessData) {
  return apiFetch("/api/v1/onboarding/business-profile", {
    method: "POST",
    body: JSON.stringify(businessData),
  });
}

/**
 * STEP 4: Document Upload
 * POST /api/v1/documents/upload
 * Uses FormData without manual Content-Type header.
 */
export async function uploadDocument(file, documentType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  formData.append("fileName", file.name);

  try {
    const res = await fetch("/api/v1/documents/upload", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success !== false) {
      return {
        success: true,
        documentId: data?.data?.documentId || data?.documentId,
        data: data?.data || data,
      };
    }

    return {
      success: false,
      error: data?.message || data?.error || `Document upload failed with status ${res.status}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to upload document to backend.",
    };
  }
}

/**
 * STEP 5 / PAYMENT: Process and Verify ₹365 Membership Payment
 * POST /api/v1/onboarding/payment
 */
export async function submitPayment(paymentData) {
  const payload = {
    amount: paymentData.amount || 365,
    role: paymentData.role,
    paymentMethod: paymentData.paymentMethod || "UPI",
    transactionId: paymentData.transactionId,
    plan: paymentData.plan || "Platform Membership (₹365)",
    paymentDetails: paymentData.paymentDetails || {},
    timestamp: new Date().toISOString(),
  };

  return apiFetch("/api/v1/onboarding/payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * STEP 6: Final Application Submission
 * POST /api/v1/applications/submit
 */
export async function submitApplication(payload) {
  return apiFetch("/api/v1/applications/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * STEP 7: Get Application Status
 * GET /api/v1/applications/status?id=...
 */
export async function getApplicationStatus(applicationId) {
  return apiFetch(`/api/v1/applications/status?id=${encodeURIComponent(applicationId)}`, {
    method: "GET",
  });
}
