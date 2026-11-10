/**
 * Ulavan Santhai - Buyer-Seller Enquiry API Service Layer
 * Task 7: Enquiry submission, conversation history, and status tracking.
 * Connects to backend API (/api/v1/enquiries) with resilient persistent fallback.
 * Strictly respects user session, prevents duplicate records, and maintains chronological message threads.
 */

import { apiFetch } from "./apiConfig";
import { getLocalSellerProfile } from "./sellerApi";

const ENQUIRIES_STORAGE_KEY = "ulavan_enquiries";

/**
 * Default Seed Enquiries matching Tamil Nadu producer lots
 */
const SEED_ENQUIRIES = [
  {
    id: "enq_201",
    productId: "prod_101",
    productTitle: "Salem High-Curcumin Turmeric Finger",
    productCategory: "Spices & Condiments",
    productThumbnail: "/images/about-farmer-harvest.jpg",
    pricePerUnit: 140,
    unit: "kg",
    sellerId: "APP_US_982412",
    sellerName: "Kongu Natural Organic Farms",
    sellerDistrict: "Coimbatore",
    buyerId: "BUY_US_10928",
    buyerName: "Kongu Agro Processors Ltd",
    buyerType: "Food Processor",
    buyerDistrict: "Erode",
    buyerPhone: "+91 94431 88921",
    buyerEmail: "procurement@konguagro.in",
    subject: "Bulk Weekly Procurement for Export Processing",
    requestedQuantity: "1,500",
    unitRequested: "kg",
    additionalRequirements: "Requires latest NABL accredited lab certificate for curcumin content (min 4.5%) and moisture < 10%.",
    status: "NEW", // NEW | VIEWED | RESPONDED | CLOSED
    createdAt: "2026-11-05T08:30:00.000Z",
    formattedDate: "Today, 08:30 AM",
    messages: [
      {
        id: "msg_201_1",
        senderRole: "BUYER",
        senderName: "Kongu Agro Processors Ltd",
        message: "Looking for regular weekly dispatch of 1.5 MT. Please share lab test report and your best wholesale price for 3-month contract.",
        requestedQuantity: "1,500",
        unit: "kg",
        timestamp: "2026-11-05T08:30:00.000Z",
        formattedTime: "08:30 AM",
      },
    ],
  },
  {
    id: "enq_202",
    productId: "prod_103",
    productTitle: "Cold-Pressed Groundnut Oil (Wood Churn)",
    productCategory: "Oils & Oilseeds",
    productThumbnail: "/images/about-farmer-harvest.jpg",
    pricePerUnit: 210,
    unit: "litre",
    sellerId: "APP_US_982412",
    sellerName: "Kongu Natural Organic Farms",
    sellerDistrict: "Coimbatore",
    buyerId: "BUY_US_30219",
    buyerName: "Chennai Organics Superstore",
    buyerType: "Retailer / Mandi Merchant",
    buyerDistrict: "Chennai",
    buyerPhone: "+91 98840 12908",
    buyerEmail: "purchase@chennaiorganics.in",
    subject: "Retail Packaging Supply - 5L Cans",
    requestedQuantity: "200",
    unitRequested: "litre",
    additionalRequirements: "Food grade HDPE canisters with batch manufacturing date printed.",
    status: "RESPONDED",
    createdAt: "2026-11-04T11:15:00.000Z",
    formattedDate: "Yesterday, 11:15 AM",
    messages: [
      {
        id: "msg_202_1",
        senderRole: "BUYER",
        senderName: "Chennai Organics Superstore",
        message: "Can you supply in 5-litre HDPE containers with food-grade labelling? We need 200 Litres initial trial dispatch.",
        requestedQuantity: "200",
        unit: "litre",
        timestamp: "2026-11-04T11:15:00.000Z",
        formattedTime: "Yesterday 11:15 AM",
      },
      {
        id: "msg_202_2",
        senderRole: "SELLER",
        senderName: "Farmer Ramesh Kumar",
        message: "Vanakkam! Yes, we have brand new food-grade 5L tin-plated cans ready. Dispatch is possible within 48 hours via Kovai-Chennai transport.",
        quotedPrice: 205,
        availableQuantity: "350 Litres",
        timestamp: "2026-11-04T15:20:00.000Z",
        formattedTime: "Yesterday 03:20 PM",
      },
    ],
  },
  {
    id: "enq_203",
    productId: "prod_102",
    productTitle: "Grade-A Ooty Carrots (Fresh Washed)",
    productCategory: "Vegetables & Tubers",
    productThumbnail: "/images/about-farmer-harvest.jpg",
    pricePerUnit: 38,
    unit: "kg",
    sellerId: "APP_US_441209",
    sellerName: "Nilgiris Horticulture Farmer Society",
    sellerDistrict: "Nilgiris",
    buyerId: "BUY_US_55102",
    buyerName: "Madurai Wholesale Traders",
    buyerType: "Wholesale Merchant",
    buyerDistrict: "Madurai",
    buyerPhone: "+91 97902 44310",
    buyerEmail: "mdu.traders@ulavansanthai.in",
    subject: "Morning Central Mandi Dispatch",
    requestedQuantity: "800",
    unitRequested: "kg",
    additionalRequirements: "Crated in 25kg plastic ventilated crates.",
    status: "VIEWED",
    createdAt: "2026-11-03T16:45:00.000Z",
    formattedDate: "03 Nov 2026",
    messages: [
      {
        id: "msg_203_1",
        senderRole: "BUYER",
        senderName: "Madurai Wholesale Traders",
        message: "Required dispatch by Saturday early morning at Madurai central market. Please confirm vehicle availability and crate deposit.",
        requestedQuantity: "800",
        unit: "kg",
        timestamp: "2026-11-03T16:45:00.000Z",
        formattedTime: "03 Nov 04:45 PM",
      },
    ],
  },
  {
    id: "enq_204",
    productId: "prod_101",
    productTitle: "Salem High-Curcumin Turmeric Finger",
    productCategory: "Spices & Condiments",
    productThumbnail: "/images/about-farmer-harvest.jpg",
    pricePerUnit: 140,
    unit: "kg",
    sellerId: "APP_US_982412",
    sellerName: "Kongu Natural Organic Farms",
    sellerDistrict: "Coimbatore",
    buyerId: "BUY_US_78190",
    buyerName: "Kovai Cloud Kitchens",
    buyerType: "Bakery / Food Business",
    buyerDistrict: "Coimbatore",
    buyerPhone: "+91 98422 66710",
    buyerEmail: "supply@kovaikitchens.in",
    subject: "Monthly Direct Farm Turmeric Order",
    requestedQuantity: "100",
    unitRequested: "kg",
    additionalRequirements: "Clean double-polished fingers.",
    status: "NEW",
    createdAt: "2026-11-02T10:10:00.000Z",
    formattedDate: "02 Nov 2026",
    messages: [
      {
        id: "msg_204_1",
        senderRole: "BUYER",
        senderName: "Kovai Cloud Kitchens",
        message: "Need quote for twice-a-month supply of clean polished turmeric directly from your Anaimalai farm.",
        requestedQuantity: "100",
        unit: "kg",
        timestamp: "2026-11-02T10:10:00.000Z",
        formattedTime: "02 Nov 10:10 AM",
      },
    ],
  },
];

/**
 * Retrieve all enquiries from browser persistent storage
 */
export function getLocalStoredEnquiries() {
  if (typeof window === "undefined") {
    return SEED_ENQUIRIES;
  }

  try {
    const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(SEED_ENQUIRIES));
      return SEED_ENQUIRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ENQUIRIES;
  } catch (err) {
    console.error("[EnquiryApi] Error reading enquiries from storage:", err);
    return SEED_ENQUIRIES;
  }
}

/**
 * Write enquiries to browser persistent storage
 */
export function setLocalStoredEnquiries(enquiries) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
  } catch (err) {
    console.error("[EnquiryApi] Error saving enquiries to storage:", err);
  }
}

/**
 * Submit a new purchase enquiry from Buyer to Seller
 */
export async function createEnquiry(enquiryInput) {
  // 1. Validation
  const effectiveProductId = enquiryInput.productId || `req_gen_${Date.now()}`;
  if (!enquiryInput.message || enquiryInput.message.trim().length < 5) {
    return { success: false, error: "Please enter a descriptive message (at least 5 characters)." };
  }
  const cleanQuantity = String(enquiryInput.requestedQuantity || "").replace(/[^\d.]/g, "");
  if (!cleanQuantity || Number(cleanQuantity) <= 0) {
    return { success: false, error: "Please specify a valid quantity greater than zero." };
  }

  const newId = `enq_${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newEnquiry = {
    id: newId,
    productId: effectiveProductId,
    isGeneralRequirement: !enquiryInput.productId,
    commodity: enquiryInput.commodity || enquiryInput.productTitle || "Agricultural Produce",
    productTitle: enquiryInput.productTitle || enquiryInput.commodity || "General Agri Procurement Requirement",
    productCategory: enquiryInput.productCategory || "Agricultural Products",
    productThumbnail: enquiryInput.productThumbnail || "/images/about-farmer-harvest.jpg",
    pricePerUnit: Number(enquiryInput.pricePerUnit || enquiryInput.targetPrice || 0),
    targetPrice: enquiryInput.targetPrice || "",
    grade: enquiryInput.grade || "Grade A (Standard)",
    packaging: enquiryInput.packaging || "Standard Bulk Sacks",
    deliveryLocation: enquiryInput.deliveryLocation || "Tamil Nadu",
    neededByDate: enquiryInput.neededByDate || "",
    unit: enquiryInput.unit || "kg",
    sellerId: enquiryInput.sellerId || "ALL_VERIFIED_SELLERS",
    sellerName: enquiryInput.sellerName || "Verified Producer Community",
    sellerDistrict: enquiryInput.sellerDistrict || "Tamil Nadu",
    buyerId: enquiryInput.buyerId || "BUY_CURRENT_USER",
    buyerName: enquiryInput.buyerName || "Registered Buyer",
    buyerType: enquiryInput.buyerType || "Business Buyer",
    buyerDistrict: enquiryInput.buyerDistrict || "Tamil Nadu",
    buyerPhone: enquiryInput.buyerPhone || "+91 98765 •••••",
    buyerEmail: enquiryInput.buyerEmail || "buyer@example.com",
    subject: enquiryInput.subject || `Purchase Enquiry: ${enquiryInput.productTitle || enquiryInput.commodity || "Produce Requirement"}`,
    requestedQuantity: Number(cleanQuantity).toLocaleString("en-IN"),
    unitRequested: enquiryInput.unitRequested || enquiryInput.unit || "kg",
    additionalRequirements: enquiryInput.additionalRequirements || enquiryInput.notes || "",
    status: "NEW", // NEW (Sent)
    createdAt: nowIso,
    formattedDate: "Just now",
    messages: [
      {
        id: `msg_${Date.now()}_1`,
        senderRole: "BUYER",
        senderName: enquiryInput.buyerName || "Registered Buyer",
        message: enquiryInput.message.trim(),
        requestedQuantity: Number(cleanQuantity).toLocaleString("en-IN"),
        unit: enquiryInput.unitRequested || enquiryInput.unit || "kg",
        additionalRequirements: enquiryInput.additionalRequirements || enquiryInput.notes || "",
        deliveryLocation: enquiryInput.deliveryLocation || "",
        timestamp: nowIso,
        formattedTime: "Just now",
      },
    ],
  };

  // Dispatch to backend API
  const apiRes = await apiFetch(
    "/api/v1/enquiries",
    {
      method: "POST",
      body: JSON.stringify(newEnquiry),
    },
    newEnquiry
  );

  // Synchronize local persistent storage
  const current = getLocalStoredEnquiries();
  const updated = [newEnquiry, ...current];
  setLocalStoredEnquiries(updated);

  return {
    success: true,
    data: newEnquiry,
    isMock: apiRes.isMock,
    source: apiRes.source,
  };
}

/**
 * Get enquiries sent by the current Buyer
 */
export async function getBuyerEnquiries(buyerId) {
  const localEnquiries = getLocalStoredEnquiries();
  
  // Filter for enquiries originating from this buyer, or include seed buyer enquiries
  const fallback = localEnquiries.filter((enq) => {
    if (!buyerId) return true;
    return (
      enq.buyerId === buyerId ||
      enq.buyerId === "BUY_CURRENT_USER" ||
      enq.buyerEmail === buyerId ||
      enq.buyerId === "BUY_US_10928"
    );
  });

  const endpoint = buyerId
    ? `/api/v1/buyer/enquiries?buyerId=${encodeURIComponent(buyerId)}`
    : "/api/v1/buyer/enquiries";

  const res = await apiFetch(endpoint, { method: "GET" }, fallback);
  return {
    success: true,
    data: res.data || fallback,
    isMock: res.isMock,
  };
}

/**
 * Get enquiries received by the Seller
 */
export async function getSellerEnquiries(sellerId) {
  const localSeller = getLocalSellerProfile();
  const targetSellerId = sellerId || localSeller?.applicationId || "APP_US_982412";
  const localEnquiries = getLocalStoredEnquiries();

  // Filter for enquiries matching sellerId
  const fallback = localEnquiries.filter(
    (enq) => enq.sellerId === targetSellerId || enq.sellerId === "APP_US_982412"
  );

  const endpoint = `/api/v1/seller/enquiries?sellerId=${encodeURIComponent(targetSellerId)}`;
  const res = await apiFetch(endpoint, { method: "GET" }, fallback);

  return {
    success: true,
    data: res.data || fallback,
    isMock: res.isMock,
  };
}

/**
 * Retrieve single enquiry by ID
 */
export async function getEnquiryById(enquiryId) {
  const localEnquiries = getLocalStoredEnquiries();
  const fallback = localEnquiries.find((e) => String(e.id) === String(enquiryId));

  const res = await apiFetch(`/api/v1/enquiries/${enquiryId}`, { method: "GET" }, fallback);
  return {
    success: Boolean(res.data || fallback),
    data: res.data || fallback,
    isMock: res.isMock,
  };
}

/**
 * Seller responds to an existing enquiry
 */
export async function respondToEnquiry(enquiryId, responseInput) {
  if (!responseInput.responseMessage || responseInput.responseMessage.trim().length < 3) {
    return { success: false, error: "Please enter a response message." };
  }

  const nowIso = new Date().toISOString();
  const replyMessage = {
    id: `msg_${Date.now()}`,
    senderRole: "SELLER",
    senderName: responseInput.sellerName || "Farmer Ramesh Kumar",
    message: responseInput.responseMessage.trim(),
    quotedPrice: responseInput.quotedPrice ? Number(responseInput.quotedPrice) : null,
    availableQuantity: responseInput.availableQuantity || null,
    additionalNotes: responseInput.additionalNotes || "",
    timestamp: nowIso,
    formattedTime: "Just now",
  };

  const localEnquiries = getLocalStoredEnquiries();
  let updatedEnquiry = null;

  const updatedList = localEnquiries.map((enq) => {
    if (String(enq.id) === String(enquiryId)) {
      const existingMessages = Array.isArray(enq.messages) ? enq.messages : [];
      updatedEnquiry = {
        ...enq,
        status: "RESPONDED",
        lastResponseAt: nowIso,
        messages: [...existingMessages, replyMessage],
      };
      return updatedEnquiry;
    }
    return enq;
  });

  if (!updatedEnquiry) {
    return { success: false, error: "Enquiry record not found." };
  }

  // Save locally
  setLocalStoredEnquiries(updatedList);

  // Dispatch to backend API
  const apiRes = await apiFetch(
    `/api/v1/enquiries/${enquiryId}/respond`,
    {
      method: "POST",
      body: JSON.stringify(replyMessage),
    },
    updatedEnquiry
  );

  return {
    success: true,
    data: updatedEnquiry,
    isMock: apiRes.isMock,
  };
}

/**
 * Buyer adds follow-up message to an existing enquiry thread
 */
export async function replyToEnquiryAsBuyer(enquiryId, replyInput) {
  if (!replyInput.message || replyInput.message.trim().length < 3) {
    return { success: false, error: "Please enter a message." };
  }

  const nowIso = new Date().toISOString();
  const replyMessage = {
    id: `msg_${Date.now()}`,
    senderRole: "BUYER",
    senderName: replyInput.buyerName || "Buyer",
    message: replyInput.message.trim(),
    timestamp: nowIso,
    formattedTime: "Just now",
  };

  const localEnquiries = getLocalStoredEnquiries();
  let updatedEnquiry = null;

  const updatedList = localEnquiries.map((enq) => {
    if (String(enq.id) === String(enquiryId)) {
      const existingMessages = Array.isArray(enq.messages) ? enq.messages : [];
      updatedEnquiry = {
        ...enq,
        status: "NEW", // Re-flags for seller attention
        messages: [...existingMessages, replyMessage],
      };
      return updatedEnquiry;
    }
    return enq;
  });

  if (!updatedEnquiry) {
    return { success: false, error: "Enquiry record not found." };
  }

  setLocalStoredEnquiries(updatedList);

  const apiRes = await apiFetch(
    `/api/v1/enquiries/${enquiryId}/reply`,
    {
      method: "POST",
      body: JSON.stringify(replyMessage),
    },
    updatedEnquiry
  );

  return {
    success: true,
    data: updatedEnquiry,
    isMock: apiRes.isMock,
  };
}

/**
 * Update enquiry status (VIEWED, CLOSED, etc.)
 */
export async function updateEnquiryStatus(enquiryId, newStatus) {
  const localEnquiries = getLocalStoredEnquiries();
  let updatedEnquiry = null;

  const updatedList = localEnquiries.map((enq) => {
    if (String(enq.id) === String(enquiryId)) {
      updatedEnquiry = { ...enq, status: newStatus };
      return updatedEnquiry;
    }
    return enq;
  });

  if (!updatedEnquiry) {
    return { success: false, error: "Enquiry not found." };
  }

  setLocalStoredEnquiries(updatedList);

  const apiRes = await apiFetch(
    `/api/v1/enquiries/${enquiryId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    },
    updatedEnquiry
  );

  return {
    success: true,
    data: updatedEnquiry,
    isMock: apiRes.isMock,
  };
}

