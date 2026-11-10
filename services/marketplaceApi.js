/**
 * Ulavan Santhai - Buyer Marketplace API Service
 * Fetches published agricultural products from all verified sellers across Tamil Nadu.
 * Enforces strict visibility rules: ONLY approved & active products are displayed.
 * Masks restricted seller contact details according to marketplace access rules.
 */

import { apiFetch } from "./apiConfig";
import { getLocalStoredProducts } from "./productApi";
import { B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

/**
 * Fetch all published products visible on the public/buyer marketplace
 * Rules:
 * 1. ONLY products with status 'ACTIVE' or 'PUBLISHED' are returned.
 * 2. Inactive, Pending Review, Draft, and Rejected products are strictly omitted.
 * 3. Restricted seller direct contacts (mobile, email) are omitted/masked.
 */
export async function getMarketplaceProducts() {
  // 1. Gather all products from local storage and seed published list
  const locallyStored = getLocalStoredProducts();

  // Combine local seller products with the multi-seller verified B2B catalog
  const mergedMap = new Map();
  B2B_CATALOG_PRODUCTS.forEach((p) => mergedMap.set(String(p.id), p));
  locallyStored.forEach((p) => {
    // If seller created local product, ensure it has images & status
    mergedMap.set(String(p.id), {
      ...p,
      tamilTitle: p.tamilTitle || p.title,
      isSoldOut: p.availabilityStatus === "SOLD_OUT" || Number(p.availableStock) <= 0,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.thumbnail || "/images/photographs/farmer-harvest.jpg"],
    });
  });

  const allProducts = Array.from(mergedMap.values());

  // 2. Strict Approval & Visibility Filter:
  // ONLY products that are approved and published (ACTIVE / PUBLISHED)
  const publishedProducts = allProducts.filter(
    (p) => p.status === "ACTIVE" || p.status === "PUBLISHED"
  );

  // 3. Mask restricted direct contacts (unlocked only through sellerAccessApi)
  const sanitizedProducts = publishedProducts.map((p) => ({
    ...p,
    sellerPhone: undefined,
    sellerEmail: undefined,
  }));

  // 4. Dispatch to backend API with resilient fallback
  const res = await apiFetch(
    "/api/v1/marketplace/products",
    { method: "GET" },
    sanitizedProducts
  );

  return {
    success: true,
    data: res.isMock ? sanitizedProducts : res.data,
    isMock: res.isMock,
    source: res.source,
  };
}

/**
 * Helper to get a single product by ID
 */
export async function getMarketplaceProductById(id) {
  const allRes = await getMarketplaceProducts();
  if (allRes.success && Array.isArray(allRes.data)) {
    const product = allRes.data.find((p) => String(p.id) === String(id));
    return {
      success: !!product,
      data: product || null,
    };
  }
  return { success: false, data: null };
}
