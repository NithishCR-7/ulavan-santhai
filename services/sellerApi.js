/**
 * Ulavan Santhai - Seller API Service
 * Integrates existing Onboarding (/onboarding) data directly into the Seller Dashboard and Profile.
 * Reuses the 8 Seller classification schemas and verification document statuses without asking for duplicate data.
 */

import { apiFetch } from "./apiConfig";
import { mockSellerDashboardData } from "@/data/mockSellerDashboard";
import { getLocalStoredProducts } from "./productApi";

/**
 * Helper to retrieve stored onboarding seller profile from browser session
 */
export function getLocalSellerProfile() {
  if (typeof window === "undefined") {
    return mockSellerDashboardData.sellerInfo;
  }

  try {
    const raw =
      sessionStorage.getItem("ulavan_user") ||
      sessionStorage.getItem("ulavan_registered_user") ||
      localStorage.getItem("ulavan_registered_user");

    if (raw) {
      const parsed = JSON.parse(raw);
      const mock = mockSellerDashboardData.sellerInfo;

      // Check if user has completed onboarding with sellerData
      const sellerData = parsed.sellerData || mock.sellerData;
      const sellerType = parsed.sellerType || sellerData?.sellerType || mock.sellerType;

      return {
        ...mock,
        name: parsed.name || parsed.username || mock.name,
        username: parsed.username || parsed.name || mock.username,
        email: parsed.email || mock.email,
        mobile: parsed.mobile || mock.mobile,
        role: parsed.role || "Seller",
        sellerType: sellerType,
        applicationId: parsed.applicationId || mock.applicationId,
        status: parsed.status || mock.status,
        isPaid: parsed.isPaid ?? mock.isPaid,

        // Common Location
        district: sellerData?.district || parsed.district || mock.district,
        village: sellerData?.village || parsed.village || mock.village,
        pinCode: sellerData?.pinCode || parsed.pinCode || mock.pinCode,
        farmAddress: sellerData?.farmAddress || parsed.farmAddress || mock.farmAddress,

        // Seller classification specific data (Farmer, FPO, Organic, Manufacturer, etc.)
        sellerData: {
          ...mock.sellerData,
          ...sellerData,
          sellerType,
        },

        // Verification Document statuses (Aadhaar, Land records, FSSAI, GSTIN)
        uploadedDocs: parsed.uploadedDocs || mock.uploadedDocs,
      };
    }
  } catch (err) {
    console.warn("[Seller API] Could not parse stored session profile:", err.message);
  }

  return mockSellerDashboardData.sellerInfo;
}

/**
 * Fetch complete dashboard overview for the authenticated seller
 * Combines live onboarding profile with catalog metrics and inquiries
 */
export async function getSellerDashboardData() {
  const localProfile = getLocalSellerProfile();
  const storedProducts = getLocalStoredProducts();

  const totalProducts = storedProducts.length;
  const activeProducts = storedProducts.filter((p) => p.status === "ACTIVE").length;
  const pendingApproval = storedProducts.filter((p) => p.status === "PENDING" || p.status === "WAITING_APPROVAL").length;

  const dynamicMetrics = {
    ...mockSellerDashboardData.metrics,
    totalProducts,
    activeProducts,
    pendingApproval,
  };

  const fallback = {
    ...mockSellerDashboardData,
    sellerInfo: localProfile,
    metrics: dynamicMetrics,
    recentProducts: storedProducts,
  };

  const res = await apiFetch("/api/v1/seller/dashboard", { method: "GET" }, fallback);

  // If mock fallback was used, ensure the latest session onboarding profile is attached
  if (res.isMock && res.data) {
    res.data.sellerInfo = localProfile;
    res.data.recentProducts = storedProducts;
    res.data.metrics = dynamicMetrics;
  }

  return res;
}

/**
 * Fetch seller profile details (reusing existing onboarding data)
 */
export async function getSellerProfile() {
  const localProfile = getLocalSellerProfile();
  return await apiFetch("/api/v1/seller/profile", { method: "GET" }, localProfile);
}

/**
 * Update seller profile details (reusing existing onboarding data structure)
 * Does NOT create duplicate records; updates existing session & dispatches to API.
 */
export async function updateSellerProfile(updatedFields) {
  // 1. Dispatch update to backend API
  const apiResult = await apiFetch("/api/v1/seller/profile", {
    method: "PUT",
    body: JSON.stringify(updatedFields),
  });

  // 2. Synchronize local browser session so updates reflect immediately
  if (typeof window !== "undefined") {
    try {
      const current = getLocalSellerProfile();
      const merged = {
        ...current,
        ...updatedFields,
        sellerData: {
          ...current.sellerData,
          ...updatedFields.sellerData,
        },
      };

      sessionStorage.setItem("ulavan_user", JSON.stringify(merged));
      sessionStorage.setItem("ulavan_registered_user", JSON.stringify(merged));
      localStorage.setItem("ulavan_registered_user", JSON.stringify(merged));
    } catch (err) {
      console.error("[Seller API] Failed to update session profile:", err);
    }
  }

  return {
    success: true,
    data: updatedFields,
    isMock: apiResult.isMock,
    source: apiResult.source,
  };
}

/**
 * Fetch recent buyer enquiries for the seller
 */
export async function getSellerEnquiries() {
  return await apiFetch(
    "/api/v1/seller/enquiries",
    { method: "GET" },
    mockSellerDashboardData.recentEnquiries
  );
}
