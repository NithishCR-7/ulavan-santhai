/**
 * Ulavan Santhai - Seller API Service
 * Strictly connects to backend API endpoints (/api/v1/seller/...)
 * No mock data, no synthetic fallbacks.
 */

import { apiFetch } from "./apiConfig";

/**
 * Fetch complete dashboard overview for the authenticated seller strictly from backend
 */
export async function getSellerDashboardData() {
  const res = await apiFetch("/api/v1/seller/dashboard", { method: "GET" });
  return res;
}

/**
 * Fetch seller profile details strictly from backend
 */
export async function getSellerProfile() {
  return apiFetch("/api/v1/seller/profile", { method: "GET" });
}

/**
 * Update seller profile details strictly on backend
 */
export async function updateSellerProfile(updatedFields) {
  return apiFetch("/api/v1/seller/profile", {
    method: "PUT",
    body: JSON.stringify(updatedFields),
  });
}

/**
 * Helper to retrieve stored session user if needed for display
 */
export function getLocalSellerProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem("ulavan_user") ||
      sessionStorage.getItem("ulavan_registered_user") ||
      localStorage.getItem("ulavan_registered_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
