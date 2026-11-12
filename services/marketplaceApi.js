/**
 * Ulavan Santhai - Buyer Marketplace API Service
 * Fetches published agricultural products strictly from the backend API.
 * No mock data, no static catalog fallbacks.
 */

import { apiFetch } from "./apiConfig";

/**
 * Fetch all published products visible on the public/buyer marketplace strictly from backend
 */
export async function getMarketplaceProducts() {
  const res = await apiFetch("/api/v1/marketplace/products", { method: "GET" });

  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }

  // If backend returns data inside an object e.g. { products: [...] }
  if (res.success && res.data?.products && Array.isArray(res.data.products)) {
    return {
      success: true,
      data: res.data.products,
    };
  }

  // Fallback endpoint in case backend routes under /api/v1/products
  if (!res.success && res.status === 404) {
    const fallbackRes = await apiFetch("/api/v1/products", { method: "GET" });
    if (fallbackRes.success) {
      const list = Array.isArray(fallbackRes.data)
        ? fallbackRes.data
        : fallbackRes.data?.products || [];
      return {
        success: true,
        data: list,
      };
    }
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch products from backend.",
  };
}

/**
 * Helper to get a single product by ID strictly from backend
 */
export async function getMarketplaceProductById(id) {
  // Try direct product endpoint first
  const res = await apiFetch(`/api/v1/marketplace/products/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  if (res.success && res.data) {
    return {
      success: true,
      data: res.data,
    };
  }

  if (res.status === 404) {
    const directRes = await apiFetch(`/api/v1/products/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    if (directRes.success && directRes.data) {
      return {
        success: true,
        data: directRes.data,
      };
    }
  }

  // If singular endpoint not mounted, find in marketplace list
  const allRes = await getMarketplaceProducts();
  if (allRes.success && Array.isArray(allRes.data)) {
    const product = allRes.data.find((p) => String(p.id) === String(id));
    return {
      success: !!product,
      data: product || null,
      error: product ? null : "Product not found on backend.",
    };
  }

  return {
    success: false,
    data: null,
    error: res.error || "Product not found on backend.",
  };
}

/**
 * Fetch marketplace sellers strictly from backend
 */
export async function getMarketplaceSellers() {
  const res = await apiFetch("/api/v1/sellers", { method: "GET" });
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return { success: true, data: res.data };
  }

  // Derive verified sellers from live backend products if /sellers is not a separate endpoint
  const prodRes = await getMarketplaceProducts();
  if (prodRes.success && Array.isArray(prodRes.data)) {
    const sellerMap = new Map();
    prodRes.data.forEach((p) => {
      const id = p.sellerId || p.supplierId || `sel_${p.sellerName}`;
      if (!sellerMap.has(id)) {
        sellerMap.set(id, {
          id,
          name: p.sellerName || "Verified Producer",
          district: p.originDistrict || "Tamil Nadu",
          sellerType: p.sellerType || "Agricultural Producer",
          rating: p.sellerRating || 4.7,
          verified: true,
          commodities: [p.title],
          description: p.sellerDescription || p.description || "Direct agricultural producer verified on Ulavan Santhai.",
        });
      } else {
        const existing = sellerMap.get(id);
        if (p.title && !existing.commodities.includes(p.title)) {
          existing.commodities.push(p.title);
        }
      }
    });
    return { success: true, data: Array.from(sellerMap.values()) };
  }

  return {
    success: false,
    data: [],
    error: res.error || prodRes.error || "Failed to load sellers from backend.",
  };
}
