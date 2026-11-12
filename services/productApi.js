/**
 * Ulavan Santhai - Seller Product API Service Layer
 * Strictly connects with backend /api/v1/seller/products.
 * No mock data, no synthetic fallbacks.
 */

import { apiFetch } from "./apiConfig";

/**
 * Fetch all products for the authenticated seller strictly from backend
 */
export async function getSellerProducts() {
  const res = await apiFetch("/api/v1/seller/products", { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch seller products from backend.",
  };
}

/**
 * Fetch a single product by ID strictly from backend
 */
export async function getSellerProductById(productId) {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}`, {
    method: "GET",
  });
}

/**
 * Create a new agricultural product listing strictly on backend
 */
export async function createSellerProduct(productData, isDraft = false) {
  const payload = {
    title: productData.title?.trim() || "",
    category: productData.category || "Vegetables",
    subcategory: productData.subcategory?.trim() || "",
    description: productData.description?.trim() || "",
    images: productData.images || [],
    variety: productData.variety?.trim() || "",
    grade: productData.grade || "Grade A",
    specifications: productData.specifications?.trim() || "",
    organicStatus: productData.organicStatus || "Conventional",
    certificationDetails: productData.certificationDetails?.trim() || "",
    availableStock: Number(productData.availableStock) || 0,
    unit: productData.unit || "kg",
    minOrderQuantity: Number(productData.minOrderQuantity) || 1,
    moqUnit: productData.moqUnit || productData.unit || "kg",
    pricePerUnit: Number(productData.pricePerUnit) || 0,
    availabilityStatus: productData.availabilityStatus || "IN_STOCK",
    originDistrict: productData.originDistrict || "Coimbatore",
    originState: productData.originState || "Tamil Nadu",
    originLocation: productData.originLocation || "",
    status: isDraft ? "DRAFT" : "PENDING",
  };

  return apiFetch("/api/v1/seller/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing product strictly on backend
 */
export async function updateSellerProduct(productId, updatedFields) {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify(updatedFields),
  });
}

/**
 * Deactivate or Reactivate a product strictly on backend
 */
export async function toggleProductStatus(productId, newStatus, reason = "") {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus, reason }),
  });
}

/**
 * Safe local getter fallback for offline SSR or preview
 */
export function getLocalStoredProducts() {
  return [];
}

export function persistLocalProducts() {}
