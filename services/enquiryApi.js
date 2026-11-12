/**
 * Ulavan Santhai - Buyer-Seller Enquiry API Service Layer
 * Strictly connects to backend API (/api/v1/enquiries).
 * No fake seed data or mock fallback data.
 */

import { apiFetch } from "./apiConfig";

/**
 * Submit a new enquiry to a seller strictly via backend API
 */
export async function createEnquiry(enquiryInput) {
  if (!enquiryInput.message || enquiryInput.message.trim().length < 5) {
    return {
      success: false,
      error: "Please enter a specific procurement enquiry message (minimum 5 characters).",
    };
  }

  const payload = {
    productId: enquiryInput.productId || null,
    productTitle: enquiryInput.productTitle || enquiryInput.commodity || "Produce Requirement",
    productCategory: enquiryInput.productCategory || "Agricultural Products",
    sellerId: enquiryInput.sellerId || "ALL_VERIFIED_SELLERS",
    sellerName: enquiryInput.sellerName || "Verified Producer",
    buyerName: enquiryInput.buyerName || "Buyer",
    buyerType: enquiryInput.buyerType || "Business Buyer",
    buyerPhone: enquiryInput.buyerPhone || "",
    buyerEmail: enquiryInput.buyerEmail || "",
    requestedQuantity: enquiryInput.quantity || enquiryInput.requestedQuantity || "100 kg",
    unit: enquiryInput.unit || "kg",
    message: enquiryInput.message.trim(),
    deliveryLocation: enquiryInput.deliveryLocation || "",
    targetPrice: enquiryInput.targetPrice || "",
  };

  return apiFetch("/api/v1/enquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get enquiries sent by the current Buyer strictly from backend API
 */
export async function getBuyerEnquiries(buyerId) {
  const endpoint = buyerId
    ? `/api/v1/buyer/enquiries?buyerId=${encodeURIComponent(buyerId)}`
    : "/api/v1/buyer/enquiries";

  const res = await apiFetch(endpoint, { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }

  // Fallback endpoint check if backend uses /api/v1/enquiries
  if (!res.success && res.status === 404) {
    const directRes = await apiFetch("/api/v1/enquiries", { method: "GET" });
    if (directRes.success && Array.isArray(directRes.data)) {
      return {
        success: true,
        data: directRes.data,
      };
    }
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch enquiries from backend.",
  };
}

/**
 * Get enquiries received by the Seller strictly from backend API
 */
export async function getSellerEnquiries(sellerId) {
  const endpoint = sellerId
    ? `/api/v1/seller/enquiries?sellerId=${encodeURIComponent(sellerId)}`
    : "/api/v1/seller/enquiries";

  const res = await apiFetch(endpoint, { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch seller enquiries from backend.",
  };
}

/**
 * Retrieve single enquiry by ID strictly from backend
 */
export async function getEnquiryById(enquiryId) {
  return apiFetch(`/api/v1/enquiries/${encodeURIComponent(enquiryId)}`, {
    method: "GET",
  });
}

/**
 * Seller responds to an existing enquiry strictly via backend API
 */
export async function respondToEnquiry(enquiryId, responseInput) {
  if (!responseInput.responseMessage || responseInput.responseMessage.trim().length < 3) {
    return { success: false, error: "Please enter a response message." };
  }

  const payload = {
    responseMessage: responseInput.responseMessage.trim(),
    quotedPrice: responseInput.quotedPrice ? Number(responseInput.quotedPrice) : undefined,
    availableQuantity: responseInput.availableQuantity || undefined,
  };

  return apiFetch(`/api/v1/enquiries/${encodeURIComponent(enquiryId)}/respond`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Buyer adds a follow-up reply message to an enquiry thread
 */
export async function replyToEnquiryAsBuyer(enquiryId, messageText) {
  return apiFetch(`/api/v1/enquiries/${encodeURIComponent(enquiryId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ message: messageText, senderRole: "BUYER" }),
  });
}

/**
 * Update status of an enquiry (e.g. ANSWERED, CLOSED, ARCHIVED)
 */
export async function updateEnquiryStatus(enquiryId, status) {
  return apiFetch(`/api/v1/enquiries/${encodeURIComponent(enquiryId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
