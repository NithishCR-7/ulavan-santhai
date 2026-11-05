/**
 * Ulavan Santhai - Seller Product API Service Layer
 * Handles agricultural product creation, drafting, retrieval, and updating.
 * Connects with backend /api/v1/seller/products and manages local session persistence
 * without fake database saves or pretending media upload services are active.
 */

import { apiFetch } from "./apiConfig";
import { getLocalSellerProfile } from "./sellerApi";
import { mockSellerDashboardData } from "@/data/mockSellerDashboard";

const STORAGE_KEY = "ulavan_seller_products";

/**
 * Retrieve local products persisted in browser storage
 */
export function getLocalStoredProducts() {
  if (typeof window === "undefined") {
    return mockSellerDashboardData.recentProducts;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Product API] Error reading local stored products:", err);
  }

  // Initial seed from mock seller products
  return mockSellerDashboardData.recentProducts;
}

/**
 * Persist products to browser storage for local preview
 */
export function persistLocalProducts(products) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn("[Product API] Error persisting products locally:", err);
  }
}

/**
 * Fetch all products for the authenticated seller
 */
export async function getSellerProducts() {
  const localProducts = getLocalStoredProducts();

  const res = await apiFetch(
    "/api/v1/seller/products",
    { method: "GET" },
    localProducts
  );

  return {
    success: true,
    data: res.isMock ? localProducts : res.data,
    isMock: res.isMock,
    source: res.source,
  };
}

/**
 * Fetch a single product by ID
 */
export async function getSellerProductById(productId) {
  const localProducts = getLocalStoredProducts();
  const matched = localProducts.find((p) => String(p.id) === String(productId));

  const res = await apiFetch(
    `/api/v1/seller/products/${productId}`,
    { method: "GET" },
    matched || null
  );

  return {
    success: true,
    data: res.isMock ? matched : res.data,
    isMock: res.isMock,
    source: res.source,
  };
}

/**
 * Create a new agricultural product listing
 * @param {object} productData - Form values entered by seller
 * @param {boolean} isDraft - Whether saving as draft or submitting for review
 */
export async function createSellerProduct(productData, isDraft = false) {
  const seller = getLocalSellerProfile();

  const newId = `prod_${Date.now()}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fullProduct = {
    id: newId,
    sellerId: seller?.applicationId || "APP_US_982412",
    sellerName: seller?.name || "Farmer Ramesh Kumar",
    sellerType: seller?.sellerType || "Farmer",
    
    // Basic Details
    title: productData.title?.trim() || "",
    category: productData.category || "Vegetables",
    subcategory: productData.subcategory?.trim() || "",
    description: productData.description?.trim() || "",
    
    // Images
    images: productData.images || [],
    thumbnail:
      productData.images && productData.images.length > 0
        ? productData.images[0].url
        : "/images/about-farmer-harvest.jpg",

    // Specifications
    variety: productData.variety?.trim() || "",
    grade: productData.grade || "Grade A",
    specifications: productData.specifications?.trim() || "",
    organicStatus: productData.organicStatus || "Conventional",
    certificationDetails: productData.certificationDetails?.trim() || "",

    // Classification-specific contextual attributes
    farmingMethod: productData.farmingMethod || "",
    harvestSeason: productData.harvestSeason || "",
    aggregatedSupply: productData.aggregatedSupply || "",
    rawCommodityGrade: productData.rawCommodityGrade || "",
    processingMethod: productData.processingMethod || "",
    shelfLife: productData.shelfLife || "",
    packagingType: productData.packagingType || "",
    fssaiLicense: productData.fssaiLicense || seller?.uploadedDocs?.fssaiCert?.name || "",

    // Quantity & Pricing
    availableStock: Number(productData.availableStock) || 0,
    unit: productData.unit || "kg",
    minOrderQuantity: Number(productData.minOrderQuantity) || 1,
    moqUnit: productData.moqUnit || productData.unit || "kg",
    pricePerUnit: Number(productData.pricePerUnit) || 0,
    availabilityStatus: productData.availabilityStatus || "IN_STOCK",
    harvestDate: productData.harvestDate || formattedDate,

    // Origin Location (defaulted from seller onboarding)
    originDistrict: productData.originDistrict || seller?.district || "Coimbatore",
    originState: productData.originState || "Tamil Nadu",
    originLocation: productData.originLocation || seller?.farmAddress || "Anaimalai",
    isCustomOrigin: Boolean(productData.isCustomOrigin),

    // Status & Timestamps
    status: isDraft ? "DRAFT" : "PENDING", // PENDING = Under Review / Waiting Approval
    createdAt: formattedDate,
    updatedAt: formattedDate,
  };

  // 1. Persist to local browser storage so seller can view instantly
  const currentList = getLocalStoredProducts();
  const updatedList = [fullProduct, ...currentList];
  persistLocalProducts(updatedList);

  // 2. Dispatch to backend API
  const apiRes = await apiFetch(
    "/api/v1/seller/products",
    {
      method: "POST",
      body: JSON.stringify(fullProduct),
    },
    fullProduct
  );

  return {
    success: true,
    data: fullProduct,
    isMock: apiRes.isMock,
    source: apiRes.source,
  };
}

/**
 * Update an existing product
 */
export async function updateSellerProduct(productId, updatedFields) {
  const currentList = getLocalStoredProducts();
  const index = currentList.findIndex((p) => String(p.id) === String(productId));

  let updatedProduct = null;
  if (index !== -1) {
    updatedProduct = {
      ...currentList[index],
      ...updatedFields,
      updatedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    currentList[index] = updatedProduct;
    persistLocalProducts(currentList);
  }

  const apiRes = await apiFetch(
    `/api/v1/seller/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(updatedFields),
    },
    updatedProduct
  );

  return {
    success: true,
    data: updatedProduct,
    isMock: apiRes.isMock,
    source: apiRes.source,
  };
}
