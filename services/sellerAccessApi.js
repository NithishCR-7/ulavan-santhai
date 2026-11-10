/**
 * Ulavan Santhai - Seller Access & Entitlement API Service
 * Implements the BRD rules for Buyer-to-Seller contact access:
 * - Base Buyer Access Plan (₹365): Includes 10 free Seller contact unlocks.
 * - Additional views: ₹10 top-up per 10 additional unlocks.
 * - Deductions occur ONLY when unlocking a new Seller for the first time.
 * - Repeat visits to an already unlocked Seller NEVER consume another view (0 deduction).
 * - Sensitive identity documents (Aadhaar, land records) are NEVER exposed.
 */

import { apiFetch } from "./apiConfig";
import { getLocalSellerProfile } from "./sellerApi";

const QUOTA_STORAGE_KEY = "ulavan_buyer_quota";
const UNLOCKED_SELLERS_KEY = "ulavan_unlocked_sellers";
const ACCESS_HISTORY_KEY = "ulavan_buyer_access_history";

// Known verified seller directory matching our Tamil Nadu marketplace catalog
const SELLER_DIRECTORY = {
  APP_US_982412: {
    sellerId: "APP_US_982412",
    contactPerson: "Farmer Ramesh Kumar",
    businessName: "Kongu Natural Organic Farms",
    sellerType: "Organic Producer",
    phone: "+91 98765 43210",
    email: "ramesh@ulavansanthai.in",
    address: "No. 12, Thottam Road, Anaimalai, Pollachi",
    district: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "642001",
    gstin: "",
    fssaiNumber: "10020042000789",
    verified: true,
  },
  APP_US_441209: {
    sellerId: "APP_US_441209",
    contactPerson: "Senthil Nathan (Secretary)",
    businessName: "Nilgiris Horticulture Farmer Society",
    sellerType: "Agricultural Producer (FPO)",
    phone: "+91 94432 18902",
    email: "nilgiris.hort@ulavansanthai.in",
    address: "Farmer Common Facility Centre, Ketti Valley",
    district: "Nilgiris",
    state: "Tamil Nadu",
    pinCode: "643001",
    gstin: "33AAATN4412A1Z1",
    fssaiNumber: "",
    verified: true,
  },
  APP_US_771822: {
    sellerId: "APP_US_771822",
    contactPerson: "M. Karuppasamy (Managing Partner)",
    businessName: "Kongu Traditional Chekku Producers",
    sellerType: "Ingredient Producer",
    phone: "+91 98428 55102",
    email: "kongu.chekku@ulavansanthai.in",
    address: "Plot 14, Agri Millers Road, Perundurai",
    district: "Erode",
    state: "Tamil Nadu",
    pinCode: "638052",
    gstin: "33AABCK7718B1Z8",
    fssaiNumber: "10020042000789",
    verified: true,
  },
  APP_US_312984: {
    sellerId: "APP_US_312984",
    contactPerson: "G. Murugan (Society Representative)",
    businessName: "Javadi Hills Tribal Honey Society",
    sellerType: "Farmer / Producer Group",
    phone: "+91 97890 33411",
    email: "javadi.honey@ulavansanthai.in",
    address: "Tribal Welfare Cooperative, Jamunamarathur",
    district: "Tiruvannamalai",
    state: "Tamil Nadu",
    pinCode: "635703",
    gstin: "",
    fssaiNumber: "12419008000411",
    verified: true,
  },
  APP_US_619022: {
    sellerId: "APP_US_619022",
    contactPerson: "P. Swaminathan (FPC Director)",
    businessName: "Cauvery Delta Uzhavar Producer Company",
    sellerType: "Agricultural Producer (FPO)",
    phone: "+91 94431 77620",
    email: "delta.uzhavar@ulavansanthai.in",
    address: "Uzhavar Sandhai Complex, Main Road",
    district: "Thanjavur",
    state: "Tamil Nadu",
    pinCode: "612001",
    gstin: "33AACCD6190C1Z2",
    fssaiNumber: "",
    verified: true,
  },
  APP_US_883190: {
    sellerId: "APP_US_883190",
    contactPerson: "K. Palanisamy",
    businessName: "Dindigul Traditional Agri Farmers",
    sellerType: "Farmer",
    phone: "+91 97500 22189",
    email: "dindigul.shallots@ulavansanthai.in",
    address: "Mandi Bypass Road, Ottanchatram",
    district: "Dindigul",
    state: "Tamil Nadu",
    pinCode: "624619",
    gstin: "",
    fssaiNumber: "",
    verified: true,
  },
};

/**
 * Retrieve local buyer entitlement state from session/local storage
 */
export function getLocalBuyerAccessState() {
  if (typeof window === "undefined") {
    return {
      quotaRemaining: 10,
      unlockedSellerIds: [],
      accessHistory: [],
    };
  }

  try {
    const rawQuota = sessionStorage.getItem(QUOTA_STORAGE_KEY) || localStorage.getItem(QUOTA_STORAGE_KEY);
    const quotaRemaining = rawQuota !== null ? Number(rawQuota) : 10;

    const rawUnlocked = sessionStorage.getItem(UNLOCKED_SELLERS_KEY) || localStorage.getItem(UNLOCKED_SELLERS_KEY);
    const unlockedSellerIds = rawUnlocked ? JSON.parse(rawUnlocked) : [];

    const rawHistory = sessionStorage.getItem(ACCESS_HISTORY_KEY) || localStorage.getItem(ACCESS_HISTORY_KEY);
    const accessHistory = rawHistory ? JSON.parse(rawHistory) : [];

    return {
      quotaRemaining: isNaN(quotaRemaining) ? 10 : quotaRemaining,
      unlockedSellerIds: Array.isArray(unlockedSellerIds) ? unlockedSellerIds : [],
      accessHistory: Array.isArray(accessHistory) ? accessHistory : [],
    };
  } catch (err) {
    console.warn("[Seller Access API] Error reading local access state:", err);
    return { quotaRemaining: 10, unlockedSellerIds: [], accessHistory: [] };
  }
}

/**
 * Persist buyer access state locally for session continuity
 */
function persistBuyerAccessState(quota, unlockedList, historyList) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUOTA_STORAGE_KEY, String(quota));
    localStorage.setItem(QUOTA_STORAGE_KEY, String(quota));

    sessionStorage.setItem(UNLOCKED_SELLERS_KEY, JSON.stringify(unlockedList));
    localStorage.setItem(UNLOCKED_SELLERS_KEY, JSON.stringify(unlockedList));

    sessionStorage.setItem(ACCESS_HISTORY_KEY, JSON.stringify(historyList));
    localStorage.setItem(ACCESS_HISTORY_KEY, JSON.stringify(historyList));
  } catch (err) {
    console.warn("[Seller Access API] Error persisting access state:", err);
  }
}

/**
 * Fetch current buyer's access entitlement and unlock quota
 */
export async function getBuyerAccessEntitlement() {
  const localState = getLocalBuyerAccessState();

  const fallback = {
    isMember: true,
    planName: "Buyer Access Plan (₹365)",
    baseQuota: 10,
    quotaRemaining: localState.quotaRemaining,
    unlockedCount: localState.unlockedSellerIds.length,
    unlockedSellerIds: localState.unlockedSellerIds,
  };

  const res = await apiFetch("/api/v1/buyer/access-entitlement", { method: "GET" }, fallback);

  return {
    success: true,
    data: res.isMock ? fallback : res.data,
    isMock: res.isMock,
    source: res.source,
  };
}

/**
 * Fetch seller details for a product
 * Enforces BRD privacy: returns masked contact details if not yet unlocked.
 */
export async function getSellerForProduct(sellerId) {
  const localState = getLocalBuyerAccessState();
  const isUnlocked = localState.unlockedSellerIds.includes(sellerId);

  // Match from known seller directory or dynamic seller profile
  const dynamicSeller = getLocalSellerProfile();
  const baseSeller = SELLER_DIRECTORY[sellerId] || {
    sellerId: sellerId || "APP_US_982412",
    contactPerson: dynamicSeller?.name || "Farmer Ramesh Kumar",
    businessName: dynamicSeller?.sellerData?.farmerFarmName || dynamicSeller?.farmName || "Kongu Natural Organic Farms",
    sellerType: dynamicSeller?.sellerType || "Farmer",
    phone: dynamicSeller?.mobile ? `+91 ${dynamicSeller.mobile}` : "+91 98765 43210",
    email: dynamicSeller?.email || "ramesh@ulavansanthai.in",
    address: dynamicSeller?.farmAddress || "Anaimalai, Pollachi",
    district: dynamicSeller?.district || "Coimbatore",
    state: "Tamil Nadu",
    pinCode: dynamicSeller?.pinCode || "642001",
    gstin: "",
    fssaiNumber: dynamicSeller?.sellerData?.ingFssaiNumber || "",
    verified: true,
  };

  if (isUnlocked) {
    // UNLOCKED: Return permitted business contact details
    return {
      success: true,
      isUnlocked: true,
      seller: baseSeller,
    };
  }

  // LOCKED: Mask personal phone, email and exact address
  const maskedPhone = baseSeller.phone
    ? `${baseSeller.phone.substring(0, 8)} •••••`
    : "+91 98421 •••••";

  const maskedEmail = baseSeller.email
    ? `${baseSeller.email.substring(0, 2)}•••••@${baseSeller.email.split("@")[1] || "ulavansanthai.in"}`
    : "ra•••••@ulavansanthai.in";

  return {
    success: true,
    isUnlocked: false,
    seller: {
      sellerId: baseSeller.sellerId,
      businessName: baseSeller.businessName,
      sellerType: baseSeller.sellerType,
      district: baseSeller.district,
      state: baseSeller.state,
      verified: baseSeller.verified,
      maskedPhone,
      maskedEmail,
    },
  };
}

/**
 * Unlock a seller's contact details according to BRD rules:
 * 1. If previously unlocked: 0 deduction (repeat visits are free).
 * 2. If new seller & quota > 0: Deduct 1 view, record history event, reveal details.
 * 3. If quota == 0: Return QUOTA_EXHAUSTED with top-up message.
 */
export async function unlockSellerContact(productId, sellerId, productTitle = "") {
  const localState = getLocalBuyerAccessState();
  const isAlreadyUnlocked = localState.unlockedSellerIds.includes(sellerId);

  // 1. REPEAT VISIT RULE: 0 deduction if already unlocked
  if (isAlreadyUnlocked) {
    const fullSeller = SELLER_DIRECTORY[sellerId] || (await getSellerForProduct(sellerId)).seller;
    return {
      success: true,
      deducted: false,
      quotaRemaining: localState.quotaRemaining,
      seller: fullSeller,
      message: "Seller already unlocked. No quota was deducted.",
      isRepeatVisit: true,
    };
  }

  // 2. QUOTA CHECK
  if (localState.quotaRemaining <= 0) {
    return {
      success: false,
      error: "QUOTA_EXHAUSTED",
      message: "You have used all 10 seller contact unlocks included with your plan. Please top-up for ₹10 to unlock 10 more sellers.",
      quotaRemaining: 0,
    };
  }

  // 3. SECURE ACCESS DEDUCTION
  const updatedQuota = localState.quotaRemaining - 1;
  const updatedUnlocked = [...localState.unlockedSellerIds, sellerId];

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullSeller = SELLER_DIRECTORY[sellerId] || (await getSellerForProduct(sellerId)).seller;

  const historyEntry = {
    accessId: `acc_${Date.now()}`,
    sellerId,
    sellerName: fullSeller.businessName || fullSeller.contactPerson,
    sellerType: fullSeller.sellerType,
    productId,
    productTitle: productTitle || "Agricultural Produce",
    unlockedAt: formattedDate,
    district: fullSeller.district,
  };

  const updatedHistory = [historyEntry, ...localState.accessHistory];

  // Persist locally
  persistBuyerAccessState(updatedQuota, updatedUnlocked, updatedHistory);

  // Dispatch to backend API
  const apiPayload = {
    productId,
    sellerId,
    deducted: true,
    quotaRemaining: updatedQuota,
  };

  const apiRes = await apiFetch(
    "/api/v1/buyer/unlock-seller",
    {
      method: "POST",
      body: JSON.stringify(apiPayload),
    },
    {
      success: true,
      deducted: true,
      quotaRemaining: updatedQuota,
      seller: fullSeller,
    }
  );

  return {
    success: true,
    deducted: true,
    quotaRemaining: updatedQuota,
    seller: fullSeller,
    message: `Contact details for ${fullSeller.businessName} have been unlocked successfully.`,
    isMock: apiRes.isMock,
    source: apiRes.source,
  };
}

/**
 * Top-up buyer quota (₹10 for 10 additional seller unlocks)
 */
export async function topUpBuyerQuota() {
  const localState = getLocalBuyerAccessState();
  const newQuota = localState.quotaRemaining + 10;

  persistBuyerAccessState(newQuota, localState.unlockedSellerIds, localState.accessHistory);

  await apiFetch(
    "/api/v1/buyer/quota-topup",
    {
      method: "POST",
      body: JSON.stringify({ amount: 10, addedQuota: 10 }),
    },
    { success: true, quotaRemaining: newQuota }
  );

  return {
    success: true,
    quotaRemaining: newQuota,
    message: "Successfully added 10 seller contact unlocks (+₹10).",
  };
}

/**
 * Retrieve the buyer's unlocked seller access history
 */
export async function getBuyerAccessHistory() {
  const localState = getLocalBuyerAccessState();

  const res = await apiFetch(
    "/api/v1/buyer/access-history",
    { method: "GET" },
    localState.accessHistory
  );

  return {
    success: true,
    data: res.isMock ? localState.accessHistory : res.data,
    isMock: res.isMock,
    source: res.source,
  };
}

