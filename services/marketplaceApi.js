/**
 * Ulavan Santhai - Buyer Marketplace API Service
 * Fetches published agricultural products from all verified sellers across Tamil Nadu.
 * Enforces strict visibility rules: ONLY approved & active products are displayed.
 * Masks restricted seller contact details according to marketplace access rules.
 */

import { apiFetch } from "./apiConfig";
import { getLocalStoredProducts } from "./productApi";

// Comprehensive catalog of verified published products from multiple sellers across Tamil Nadu
const SEED_PUBLISHED_PRODUCTS = [
  {
    id: "prod_101",
    sellerId: "APP_US_982412",
    sellerName: "Kongu Natural Organic Farms",
    sellerType: "Organic Producer",
    title: "Salem High-Curcumin Turmeric Finger",
    category: "Spices & Condiments",
    subcategory: "Dried Whole Spice",
    variety: "Salem Local (Curcumin 4.8%)",
    grade: "Grade A (Premium)",
    pricePerUnit: 140,
    unit: "kg",
    availableStock: 2500,
    minOrderQuantity: 100,
    moqUnit: "kg",
    organicStatus: "Certified Organic (NPOP / Jaivik Bharat)",
    certificationDetails: "Aditi Organic Certifications (Scope #0017-2024)",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-10-18",
    originDistrict: "Salem",
    originState: "Tamil Nadu",
    originLocation: "Attur, Salem",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-10-18",
  },
  {
    id: "prod_102",
    sellerId: "APP_US_441209",
    sellerName: "Nilgiris Horticulture Farmer Society",
    sellerType: "Agricultural Producer (FPO)",
    title: "Grade-A Ooty Carrots (Fresh Washed)",
    category: "Vegetables & Tubers",
    subcategory: "Root Vegetables",
    variety: "Nantes European Cross",
    grade: "Grade A (Export Quality)",
    pricePerUnit: 38,
    unit: "kg",
    availableStock: 1200,
    minOrderQuantity: 300,
    moqUnit: "kg",
    organicStatus: "Conventional Farming",
    certificationDetails: "",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-11-03",
    originDistrict: "Nilgiris",
    originState: "Tamil Nadu",
    originLocation: "Ketti Valley, Ooty",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-11-03",
  },
  {
    id: "prod_103",
    sellerId: "APP_US_771822",
    sellerName: "Kongu Traditional Chekku Producers",
    sellerType: "Ingredient Producer",
    title: "Cold-Pressed Groundnut Oil (Wood Churn)",
    category: "Oils & Oilseeds",
    subcategory: "Edible Cold-Pressed Oils",
    variety: "Marachekku (Cold Pressed)",
    grade: "Grade A (Premium)",
    pricePerUnit: 210,
    unit: "litre",
    availableStock: 450,
    minOrderQuantity: 50,
    moqUnit: "litre",
    organicStatus: "Natural / Chemical-Free Farming",
    certificationDetails: "FSSAI License #10020042000789",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-10-25",
    originDistrict: "Erode",
    originState: "Tamil Nadu",
    originLocation: "Perundurai, Erode",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-10-25",
  },
  {
    id: "prod_105",
    sellerId: "APP_US_312984",
    sellerName: "Javadi Hills Tribal Honey Society",
    sellerType: "Farmer / Producer Group",
    title: "Organic Wild Forest Honey",
    category: "Organic & Natural Produce",
    subcategory: "Natural Forest Produce",
    variety: "Javadi Hills Raw Wild Honey",
    grade: "Grade A (Export Quality)",
    pricePerUnit: 390,
    unit: "kg",
    availableStock: 80,
    minOrderQuantity: 20,
    moqUnit: "kg",
    organicStatus: "Certified Organic (NPOP / Jaivik Bharat)",
    certificationDetails: "Forest Organic Certified",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-09-15",
    originDistrict: "Tiruvannamalai",
    originState: "Tamil Nadu",
    originLocation: "Jamunamarathur, Javadi Hills",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-09-15",
  },
  {
    id: "prod_106",
    sellerId: "APP_US_619022",
    sellerName: "Cauvery Delta Uzhavar Producer Company",
    sellerType: "Agricultural Producer (FPO)",
    title: "BPT 5204 Deluxe Ponni Paddy (Aged Grains)",
    category: "Grains & Millets",
    subcategory: "Cereals & Paddy",
    variety: "BPT 5204 Andhra / Ponni Cross",
    grade: "Grade A (Premium)",
    pricePerUnit: 24,
    unit: "kg",
    availableStock: 15000,
    minOrderQuantity: 1000,
    moqUnit: "kg",
    organicStatus: "Conventional Farming",
    certificationDetails: "Seed Certification Dept TN",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-10-10",
    originDistrict: "Thanjavur",
    originState: "Tamil Nadu",
    originLocation: "Kumbakonam, Thanjavur",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-10-10",
  },
  {
    id: "prod_107",
    sellerId: "APP_US_883190",
    sellerName: "Dindigul Traditional Agri Farmers",
    sellerType: "Farmer",
    title: "Desi Country Small Red Onions (Shallots)",
    category: "Vegetables & Tubers",
    subcategory: "Shallots & Bulbs",
    variety: "Co-4 Small Onion",
    grade: "Grade A (Export Quality)",
    pricePerUnit: 48,
    unit: "kg",
    availableStock: 3500,
    minOrderQuantity: 200,
    moqUnit: "kg",
    organicStatus: "Conventional Farming",
    certificationDetails: "",
    availabilityStatus: "IN_STOCK",
    harvestDate: "2026-11-01",
    originDistrict: "Dindigul",
    originState: "Tamil Nadu",
    originLocation: "Ottanchatram, Dindigul",
    thumbnail: "/images/about-farmer-harvest.jpg",
    status: "ACTIVE",
    createdAt: "2026-11-01",
  },
];

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

  // Combine local seller products with the multi-seller seed catalog
  const mergedMap = new Map();
  SEED_PUBLISHED_PRODUCTS.forEach((p) => mergedMap.set(String(p.id), p));
  locallyStored.forEach((p) => mergedMap.set(String(p.id), p));

  const allProducts = Array.from(mergedMap.values());

  // 2. Strict Approval & Visibility Filter:
  // ONLY products that are approved and published (ACTIVE / PUBLISHED)
  const publishedProducts = allProducts.filter(
    (p) => p.status === "ACTIVE" || p.status === "PUBLISHED"
  );

  // 3. Mask restricted direct contacts
  const sanitizedProducts = publishedProducts.map((p) => ({
    ...p,
    // Ensure raw contact details are never leaked in public cards
    sellerPhone: undefined,
    sellerEmail: undefined,
  }));

  // 4. Dispatch to backend API with typed fallback
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

