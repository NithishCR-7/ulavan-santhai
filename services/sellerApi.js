/**
 * Ulavan Santhai - Seller API Service
 * Handles all seller-related requests (dashboard statistics, profile, inquiries).
 * Integrates directly with real backend endpoints when deployed,
 * or safely provides contract-compliant mock data while the backend is under development.
 */

import { apiFetch } from "./apiConfig";
import { mockSellerDashboardData } from "@/data/mockSellerDashboard";

/**
 * Fetch complete dashboard overview for the authenticated seller
 * @returns {Promise<{ success: boolean, data: object, isMock: boolean }>}
 */
export async function getSellerDashboardData() {
  return await apiFetch(
    "/api/v1/seller/dashboard",
    { method: "GET" },
    mockSellerDashboardData
  );
}

/**
 * Fetch seller profile details
 */
export async function getSellerProfile() {
  return await apiFetch(
    "/api/v1/seller/profile",
    { method: "GET" },
    mockSellerDashboardData.sellerInfo
  );
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

