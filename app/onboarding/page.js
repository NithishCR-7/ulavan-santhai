"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Stepper from "@/components/onboarding/Stepper";
import FormInput from "@/components/onboarding/FormInput";
import FormSelect from "@/components/onboarding/FormSelect";
import DocumentUploader from "@/components/onboarding/DocumentUploader";
import { submitApplication } from "@/services/onboardingApi";
import { submitRolePayment } from "@/services/paymentApi";
import { useSessionUser } from "@/services/sessionAuth";

export const BUYER_TYPES = [
  "Individual",
  "Business",
  "Manufacturer",
  "Food Processor",
  "Bakery or Food Business",
  "Reseller",
  "Other",
];

export const SELLER_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other",
];

const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

const COMMON_COMMODITIES = [
  "Fresh Vegetables", "Fruits", "Rice & Cereals", "Millets & Pulses",
  "Spices & Condiments", "Coconut & Oilseeds", "Dairy Products", "Organic Produce"
];

const COMMON_CROPS = [
  "Paddy / Rice", "Banana", "Mango", "Tomato", "Onion", "Coconut",
  "Turmeric", "Millets", "Groundnut", "Sugarcane", "Spices", "Vegetables", "Flowers"
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active role from query: "buyer" or "seller"
  const roleParam = (searchParams.get("role") || "buyer").toLowerCase();
  const [role, setRole] = useState(roleParam === "seller" ? "seller" : "buyer");

  // Stepper: 1. Profile Details -> 2. Document Upload -> 3. Review & Submit
  // (NOTE: Step 1 Account Information was removed as user already registered)
  const [currentStep, setCurrentStep] = useState(1);

  // Authenticated user from session (hydration-safe)
  const userAuth = useSessionUser();

  // Selected sub-type
  const [buyerType, setBuyerType] = useState("Individual");
  const [sellerType, setSellerType] = useState("Farmer");

  // Dynamic Buyer Form State
  const [buyerData, setBuyerData] = useState({
    // Common location
    district: "Coimbatore",
    city: "Pollachi",
    pinCode: "642001",
    address: "",

    // 1. Individual
    individualCommodities: ["Fresh Vegetables", "Fruits"],
    individualVolume: "25 - 50 kg / month",
    individualFrequency: "Weekly",
    individualPayment: "UPI Instant",

    // 2. Business
    businessName: "",
    businessConstitution: "Proprietorship",
    businessDesignation: "Proprietor / Owner",
    businessIsGst: "No",
    businessGstin: "",
    businessCommodities: ["Fresh Vegetables"],
    businessVolume: "500 kg - 2 MT / month",
    businessPaymentTerms: "Bank Transfer (NEFT/RTGS)",

    // 3. Manufacturer
    mfgCompanyName: "",
    mfgConstitution: "Private Limited",
    mfgDesignation: "Procurement Manager",
    mfgCategory: "Food & Beverage",
    mfgRawMaterials: "Corn / Maize, Oilseeds, Turmeric",
    mfgVolume: "10 - 50 MT / month",
    mfgIsGst: "Yes",
    mfgGstin: "",
    mfgPaymentTerms: "30-day Invoice Credit",

    // 4. Food Processor
    procBusinessName: "",
    procActivity: "Flour Milling & Spice Grinding",
    procRawCommodities: "Paddy, Turmeric, Chilly, Pulses",
    procCapacity: "25 MT / month",
    procFssaiNumber: "",
    procIsGst: "Yes",
    procGstin: "",
    procPaymentTerms: "NEFT / RTGS Immediate",

    // 5. Bakery or Food Business
    bakeryName: "",
    bakeryType: "Commercial Bakery & Kitchen",
    bakeryDesignation: "Head Chef / Purchase Head",
    bakeryIngredients: "Wheat Atta, Dairy Butter, Fresh Fruits, Sugar",
    bakeryFrequency: "Daily",
    bakeryFssaiNumber: "",
    bakeryIsGst: "No",
    bakeryGstin: "",

    // 6. Reseller
    resellerShopName: "",
    resellerType: "Mandi Wholesale Merchant",
    resellerCategories: ["Fresh Vegetables", "Onion & Potato", "Bananas"],
    resellerDailyVolume: "10 - 25 Quintals / day",
    resellerIsGst: "No",
    resellerGstin: "",
    resellerPaymentPreference: "Daily Settlement (UPI / Cash)",

    // 7. Other
    otherOrgName: "",
    otherCategory: "Educational Hostel / Canteen",
    otherPurpose: "Bulk kitchen feeding for students",
    otherItemsNeeded: "Rice, Vegetables, Cooking Oil, Pulses",
    otherIsGst: "No",
    otherGstin: "",
  });

  // Dynamic Seller Form State
  const [sellerData, setSellerData] = useState({
    // Common location
    district: "Coimbatore",
    village: "Anaimalai",
    pinCode: "642001",
    farmAddress: "",

    // 1. Farmer
    farmerFarmName: "Green Harvest Farm",
    farmerLandSize: "2 - 5 Acres",
    farmerCategory: "Landowner Farmer",
    farmerCrops: ["Coconut", "Banana", "Turmeric"],
    farmerAvailableQty: "50 Quintals",
    farmerHarvestMonths: "All Year",
    farmerPriceExpectation: "Fair Market Mandi Rate",
    farmerMethod: "Conventional Farming",

    // 2. Agricultural Producer (FPO / Society)
    fpoName: "Kongu Uzhavar Producer Company Ltd",
    fpoStructure: "Farmer Producer Company (FPC)",
    fpoRegNumber: "U01409TZ2021PTC028491",
    fpoMemberCount: "200 - 500 Farmers",
    fpoCombinedAcreage: "1,200 Acres",
    fpoCrops: ["Paddy / Rice", "Coconut", "Millets"],
    fpoCapacity: "150 MT / season",
    fpoIsGst: "No",
    fpoGstin: "",

    // 3. Organic Producer
    organicFarmName: "Pristine Nature Organic Farm",
    organicAcreage: "5 - 10 Acres",
    organicCertStatus: "Certified Organic (NPOP)",
    organicCertAgency: "Aditi Organic Certifications",
    organicScopeNumber: "NPOP/NAB/0017/ORG-2024",
    organicCrops: ["Turmeric", "Millets", "Vegetables"],
    organicCapacity: "30 Quintals",
    organicMethod: "Vermi-compost & Jeevamrutham (No Chemicals)",

    // 4. Raw-Material Provider
    rawProviderName: "",
    rawConstitution: "Proprietorship",
    rawCommodities: ["Raw Spices", "Coconut Copra", "Oilseeds"],
    rawSource: "Direct Farm Procurement & Aggregation",
    rawStockCapacity: "100 MT",
    rawMoq: "1 MT",
    rawIsGst: "Yes",
    rawGstin: "",

    // 5. Ingredient Producer
    ingProducerName: "",
    ingProducts: "Cold-pressed Sesame & Coconut Oils, Turmeric Paste",
    ingCapacity: "10 MT / month",
    ingTechnology: "Traditional Wood Pressed (Marachekku)",
    ingFssaiNumber: "",
    ingPackaging: "15L Barrels & Bulk Cans",
    ingIsGst: "Yes",
    ingGstin: "",

    // 6. Manufacturer
    mfgSellerName: "",
    mfgSellerConstitution: "Private Limited",
    mfgCategory: "Agro-Industrial Food Products",
    mfgProductsOffered: "Refined Agri Oils, Cattle Feed Pellets",
    mfgRawMaterialsUsed: "Groundnut Cake, Maize, Rice Bran",
    mfgCapacity: "200 MT / month",
    mfgFssaiNumber: "",
    mfgIsGst: "Yes",
    mfgGstin: "",

    // 7. Value-Added Manufacturer
    vaBrandName: "",
    vaProducts: "Traditional Pickles, Tapioca & Banana Chips, Millet Ready Mixes",
    vaAgriInputs: "Raw Mango, Lemon, Banana, Tapioca, Millets",
    vaMonthlyCapacity: "5,000 kg",
    vaPackagingFormat: "Retail Pouches & Glass Jars",
    vaFssaiNumber: "",
    vaIsGst: "No",
    vaGstin: "",

    // 8. Other
    otherSellerName: "",
    otherActivity: "Agricultural Plant Nursery & Grafted Saplings",
    otherProducts: "High-yield Coconut Saplings, Fruit Trees",
    otherStockQty: "10,000 Saplings",
    otherIsGst: "No",
    otherGstin: "",
  });

  // Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState({});

  // Feedback & State
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Stage 4: Razorpay Payment States
  const [addonBlocks, setAddonBlocks] = useState(0); // blocks of 10 sellers at ₹10 each for Buyer
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Profile Details",
      subtitle: role === "buyer" ? `${buyerType} Form` : `${sellerType} Form`,
    },
    {
      id: 2,
      title: "Document Upload",
      subtitle: "Identity & Verification",
    },
    {
      id: 3,
      title: "Review & Submit",
      subtitle: "Final Confirmation",
    },
    {
      id: 4,
      title: "Payment",
      subtitle: "₹365 Membership",
    },
  ];

  // Toggle multi-select helper
  const handleToggleArray = (setter, field, item) => {
    setter((prev) => {
      const arr = prev[field] || [];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    setFormError("");
    if (role === "buyer") {
      if (!buyerData.district) {
        setFormError("Please select your operating district.");
        return;
      }
      if (buyerType === "Business" && !buyerData.businessName.trim()) {
        setFormError("Please enter your Legal Business Name.");
        return;
      }
      if (buyerType === "Food Processor" && !buyerData.procFssaiNumber.trim()) {
        setFormError("FSSAI License / Registration Number is required for Food Processors.");
        return;
      }
      if (buyerType === "Bakery or Food Business" && !buyerData.bakeryName.trim()) {
        setFormError("Please enter your Bakery or Kitchen Name.");
        return;
      }
    } else {
      if (!sellerData.district) {
        setFormError("Please select your farm/operating district.");
        return;
      }
      if (sellerType === "Farmer" && sellerData.farmerCrops.length === 0) {
        setFormError("Please select at least one crop cultivated.");
        return;
      }
      if (sellerType === "Agricultural Producer" && !sellerData.fpoName.trim()) {
        setFormError("Please enter your Producer Organization / FPO Name.");
        return;
      }
      if (
        (sellerType === "Ingredient Producer" || sellerType === "Value-Added Manufacturer") &&
        !sellerData.ingFssaiNumber?.trim() &&
        !sellerData.vaFssaiNumber?.trim()
      ) {
        setFormError("FSSAI Food License Number is required for food ingredients and value-added manufacturing.");
        return;
      }
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    setFormError("");
    if (!uploadedDocs["ID_PROOF"]) {
      setFormError("Please upload your Government Identity Proof (Aadhaar / PAN / Voter ID) to continue.");
      return;
    }
    if (role === "seller" && !uploadedDocs["BANK_PASSBOOK"]) {
      setFormError("Bank Account Proof / Passbook is required for direct farm-gate settlement.");
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 3 -> Stage 4 Transition
  const handleProceedToPayment = () => {
    if (!termsAgreed) {
      setFormError("Please verify and accept the fair trade marketplace declaration.");
      return;
    }
    setFormError("");
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to dynamically load Razorpay Checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Stage 4: Initiate Razorpay Checkout
  const handleInitiateRazorpay = async () => {
    setFormError("");
    setIsProcessingPayment(true);

    const baseAmount = 365;
    const addonAmount = role === "buyer" ? addonBlocks * 10 : 0;
    const totalAmount = baseAmount + addonAmount;

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && razorpayKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: totalAmount * 100, // paise
          currency: "INR",
          name: "Ulavan Santhai",
          description: role === "buyer" ? `Buyer Access Plan (${10 + addonBlocks * 10} Sellers)` : "Seller Monthly Membership",
          image: "/images/ulavan-santhai-emblem@2x.png",
          prefill: {
            name: userAuth?.name || "Verified Trader",
            email: userAuth?.email || "trader@ulavansanthai.in",
            contact: userAuth?.mobile || "9876543210",
          },
          theme: {
            color: "#174B35",
          },
          handler: function (response) {
            handleFinalizePayment(response.razorpay_payment_id || `pay_rzp_${Date.now()}`);
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay live checkout error, opening preview simulation:", err);
      }
    }

    // In development or when no live key is configured:
    // Open the interactive Razorpay payment modal
    setIsProcessingPayment(false);
    setIsRazorpayModalOpen(true);
  };

  // Finalize payment upon Razorpay success
  const handleFinalizePayment = async (razorpayPaymentId) => {
    setIsProcessingPayment(true);
    setIsRazorpayModalOpen(false);

    const baseAmount = 365;
    const addonAmount = role === "buyer" ? addonBlocks * 10 : 0;
    const totalAmount = baseAmount + addonAmount;
    const buyerViewLimit = role === "buyer" ? 10 + addonBlocks * 10 : null;

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now);
    if (role === "seller") {
      endDate.setDate(endDate.getDate() + 30); // 30 days monthly validity
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1-year buyer access validity
    }
    const renewalDueDate = endDate.toISOString();

    const txId = `TXN_US_${Date.now().toString().slice(-8)}`;
    const gwRef = razorpayPaymentId || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
    const invNumber = `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const applicationId = `US_${role.toUpperCase()}_${Date.now().toString().slice(-6)}`;

    // 1. Submit Application Data
    const fullPayload = {
      applicationId,
      role: role.toUpperCase(),
      account: userAuth,
      subType: role === "buyer" ? buyerType : sellerType,
      profile: role === "buyer" ? buyerData : sellerData,
      documents: uploadedDocs,
      status: "active",
      submittedAt: startDate,
    };

    try {
      await submitApplication(fullPayload);

      // 2. Submit Payment Record via Payment API
      const checkoutData = {
        transactionId: txId,
        gatewayReference: gwRef,
        userId: userAuth?.id || `USR_${Date.now().toString().slice(-6)}`,
        userName: userAuth?.name || "Verified Member",
        userEmail: userAuth?.email || "member@ulavansanthai.in",
        userMobile: userAuth?.mobile || "9876543210",
        role: role.toUpperCase(),
        planId: role === "buyer" ? "plan_buyer_base" : "plan_seller_monthly",
        planName: role === "buyer" ? `Buyer Access Plan (${buyerViewLimit} Sellers)` : "Seller Monthly Plan (₹365/mo)",
        baseAmount,
        taxAmount: 0,
        totalAmount,
        currency: "INR",
        paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
        paymentDetails: {
          gateway: "Razorpay",
          razorpayPaymentId: gwRef,
        },
      };

      await submitRolePayment(checkoutData);

      // 3. Update session user state
      if (typeof window !== "undefined") {
        const updatedUser = {
          ...userAuth,
          role: role.charAt(0).toUpperCase() + role.slice(1),
          subType: role === "buyer" ? buyerType : sellerType,
          onboarded: true,
          applicationId,
          status: "active",
          isPaid: true,
          buyerData: role === "buyer" ? { ...buyerData, buyerType } : undefined,
          sellerData: role === "seller" ? { ...sellerData, sellerType } : undefined,
          payment: {
            transactionId: txId,
            gatewayReference: gwRef,
            invoiceNumber: invNumber,
            amount: totalAmount,
            status: "SUCCESS",
            paidAt: startDate,
            planStartDate: startDate,
            planEndDate: endDate.toISOString(),
            renewalDueDate,
            buyerViewLimit,
            buyerViewed: 0,
            buyerRemaining: buyerViewLimit,
          },
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_latest_app_id", applicationId);
        sessionStorage.setItem("ulavan_latest_payment_id", invNumber);
      }

      // 4. Update local state to show Payment Receipt confirmation
      setPaymentResult({
        transactionId: txId,
        gatewayReference: gwRef,
        invoiceNumber: invNumber,
        paymentStatus: "SUCCESS",
        paymentDate: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        planStartDate: now.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        planEndDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        renewalDueDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        role: role === "buyer" ? `Buyer (${buyerType})` : `Seller (${sellerType})`,
        planName: role === "buyer" ? "Buyer Access Plan (10 Verified Sellers)" : "Seller Monthly Plan (Unlimited Listings)",
        baseAmount,
        addonAmount,
        totalAmount,
        paymentMethod: "Razorpay Gateway",
        buyerViewLimit,
        buyerViewed: 0,
        buyerRemaining: buyerViewLimit,
        addonBlocks,
        applicationId,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Payment submission error:", err);
      setFormError("Payment processing encountered an error. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Determine which documents are required based on active type
  const isGstProvided =
    role === "buyer"
      ? buyerData.businessIsGst === "Yes" || buyerData.mfgIsGst === "Yes" || buyerData.procIsGst === "Yes"
      : sellerData.rawIsGst === "Yes" || sellerData.mfgIsGst === "Yes" || sellerData.vaIsGst === "Yes";

  const isFssaiRequired =
    role === "buyer"
      ? buyerType === "Food Processor" || buyerType === "Bakery or Food Business"
      : sellerType === "Ingredient Producer" || sellerType === "Value-Added Manufacturer" || sellerType === "Manufacturer";

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-16">
      {/* Top Brand Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* High-res 2x emblem and clear typography */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-sm border border-gray-200 group-hover:scale-105 transition-transform">
              <Image
                src="/images/ulavan-santhai-emblem@2x.png"
                alt="Ulavan Santhai Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-[#174B35] tracking-tight leading-tight">
                Ulavan Santhai
              </span>
              <span className="text-[11px] tracking-wider uppercase font-extrabold text-[#729B59]">
                Agricultural Marketplace
              </span>
            </div>
          </Link>

          {/* User Status Bar & Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#174B35] transition-colors"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden md:inline">Registered Account:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span suppressHydrationWarning className="truncate max-w-[130px] sm:max-w-none">{userAuth.name}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextRole = role === "buyer" ? "seller" : "buyer";
                setRole(nextRole);
                router.replace(`/onboarding?role=${nextRole}`);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 hover:border-[#174B35] bg-white text-gray-700 hover:text-[#174B35] transition-all cursor-pointer"
            >
              Switch to {role === "buyer" ? "Seller" : "Buyer"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Banner: Logged in credentials (shown during steps 1 to 3) */}
        {currentStep !== 4 && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Logged in credentials:</div>
                <div suppressHydrationWarning className="text-sm font-bold text-gray-900">
                  {userAuth.name} <span className="text-gray-400 font-normal">({userAuth.email} • +91 {userAuth.mobile})</span>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174B35] text-white text-xs font-bold uppercase tracking-wider self-start sm:self-center">
              <span>{role === "buyer" ? "Buyer Lane" : "Seller Lane"}</span>
            </div>
          </div>
        )}

        {/* Stepper Component (3 Steps - shown during steps 1 to 3) */}
        {currentStep !== 4 && (
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={(s) => {
              if (s < currentStep) setCurrentStep(s);
            }}
          />
        )}

        {/* Error notification */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs sm:text-sm font-semibold text-red-800">{formError}</p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: DYNAMIC PROFILE DETAILS BY TYPE                 */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Step 1 of 4</span>
              </div>
              <h2 className="text-2xl font-black text-[#174B35] tracking-tight">
                {role === "buyer" ? "Select Your Buyer Type & Details" : "Select Your Seller Type & Details"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose your specific classification below. The form will dynamically update with the exact fields tailored to your role.
              </p>
            </div>

            {/* ======================================================== */}
            {/* ROLE: BUYER - 7 DYNAMIC BUYER TYPES                     */}
            {/* ======================================================== */}
            {role === "buyer" && (
              <div className="space-y-6">
                {/* 7 Buyer Types Selection Pills / Cards */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2.5">
                    Buyer Classification <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BUYER_TYPES.map((type) => {
                      const isSelected = buyerType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBuyerType(type)}
                          className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                            isSelected
                              ? "bg-[#174B35] text-white border-[#174B35] shadow-sm scale-[1.02]"
                              : "bg-gray-50/80 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/70"
                          }`}
                        >
                          <span className="leading-tight">{type}</span>
                          <span className={`text-[10px] mt-1 font-normal ${isSelected ? "text-emerald-200" : "text-gray-400"}`}>
                            {isSelected ? "● Active Form" : "Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-form 1: Individual */}
                {buyerType === "Individual" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Individual Household Buyer Form</span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">
                        Commodities Needed for Household <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_COMMODITIES.map((c) => {
                          const sel = buyerData.individualCommodities.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleToggleArray(setBuyerData, "individualCommodities", c)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                sel ? "bg-[#174B35] text-white border-[#174B35]" : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              {sel ? `✓ ${c}` : `+ ${c}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormSelect
                        label="Monthly Consumption"
                        value={buyerData.individualVolume}
                        onChange={(e) => setBuyerData((p) => ({ ...p, individualVolume: e.target.value }))}
                        options={["Under 25 kg / month", "25 - 50 kg / month", "50 - 100 kg / month", "100+ kg / month"]}
                      />
                      <FormSelect
                        label="Purchase Frequency"
                        value={buyerData.individualFrequency}
                        onChange={(e) => setBuyerData((p) => ({ ...p, individualFrequency: e.target.value }))}
                        options={["Weekly", "Bi-weekly", "Monthly", "On-Demand"]}
                      />
                      <FormSelect
                        label="Payment Preference"
                        value={buyerData.individualPayment}
                        onChange={(e) => setBuyerData((p) => ({ ...p, individualPayment: e.target.value }))}
                        options={["UPI Instant", "Cash on Delivery"]}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 italic">
                      ✓ No GSTIN or commercial licenses required for individual consumers.
                    </div>
                  </div>
                )}

                {/* Sub-form 2: Business */}
                {buyerType === "Business" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Commercial Enterprise Buyer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Business / Enterprise Name"
                        required
                        placeholder="e.g. Kongu Agri Traders"
                        value={buyerData.businessName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, businessName: e.target.value }))}
                      />
                      <FormSelect
                        label="Constitution of Business"
                        value={buyerData.businessConstitution}
                        onChange={(e) => setBuyerData((p) => ({ ...p, businessConstitution: e.target.value }))}
                        options={["Proprietorship", "Partnership", "Private Limited", "LLP", "Public Limited"]}
                      />
                      <FormInput
                        label="Contact Person Designation"
                        placeholder="e.g. Purchase Manager"
                        value={buyerData.businessDesignation}
                        onChange={(e) => setBuyerData((p) => ({ ...p, businessDesignation: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Are you GST Registered?"
                        value={buyerData.businessIsGst}
                        onChange={(e) => setBuyerData((p) => ({ ...p, businessIsGst: e.target.value }))}
                        options={["No", "Yes"]}
                      />
                      {buyerData.businessIsGst === "Yes" ? (
                        <FormInput
                          label="GSTIN (15 Digits)"
                          required
                          maxLength={15}
                          placeholder="e.g. 33AAAAA0000A1Z5"
                          value={buyerData.businessGstin}
                          onChange={(e) => setBuyerData((p) => ({ ...p, businessGstin: e.target.value.toUpperCase() }))}
                        />
                      ) : (
                        <FormSelect
                          label="Expected Monthly Quantity"
                          value={buyerData.businessVolume}
                          onChange={(e) => setBuyerData((p) => ({ ...p, businessVolume: e.target.value }))}
                          options={["Under 500 kg", "500 kg - 2 MT", "2 - 10 MT", "10+ MT (Wholesale)"]}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form 3: Manufacturer */}
                {buyerType === "Manufacturer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Industrial Manufacturer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Legal Company Name"
                        required
                        placeholder="e.g. Apex Bio-Industries Pvt Ltd"
                        value={buyerData.mfgCompanyName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgCompanyName: e.target.value }))}
                      />
                      <FormSelect
                        label="Constitution"
                        value={buyerData.mfgConstitution}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgConstitution: e.target.value }))}
                        options={["Private Limited", "Public Limited", "LLP", "Partnership"]}
                      />
                      <FormSelect
                        label="Manufacturing Category"
                        value={buyerData.mfgCategory}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgCategory: e.target.value }))}
                        options={[
                          "Food & Beverage", "Textiles & Cotton", "Animal & Cattle Feed",
                          "Herbal & Ayurvedic Extracts", "Starch & Derivatives", "Bio-Energy"
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Raw Agricultural Materials Required"
                        required
                        placeholder="e.g. Maize, Cotton Bales, Turmeric Rhizomes"
                        value={buyerData.mfgRawMaterials}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgRawMaterials: e.target.value }))}
                      />
                      <FormSelect
                        label="Monthly Procurement Volume"
                        value={buyerData.mfgVolume}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgVolume: e.target.value }))}
                        options={["5 - 20 Metric Tonnes", "20 - 50 Metric Tonnes", "50 - 200 Metric Tonnes", "200+ Metric Tonnes"]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Are you GST Registered?"
                        value={buyerData.mfgIsGst}
                        onChange={(e) => setBuyerData((p) => ({ ...p, mfgIsGst: e.target.value }))}
                        options={["Yes", "No"]}
                      />
                      {buyerData.mfgIsGst === "Yes" && (
                        <FormInput
                          label="Company GSTIN (15 Digits)"
                          required
                          maxLength={15}
                          placeholder="e.g. 33AAAAA0000A1Z5"
                          value={buyerData.mfgGstin}
                          onChange={(e) => setBuyerData((p) => ({ ...p, mfgGstin: e.target.value.toUpperCase() }))}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form 4: Food Processor */}
                {buyerType === "Food Processor" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Agro-Food Processor Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Processing Unit / Mill Name"
                        required
                        placeholder="e.g. Annapoorna Dal & Flour Mill"
                        value={buyerData.procBusinessName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, procBusinessName: e.target.value }))}
                      />
                      <FormInput
                        label="Processing Activity"
                        placeholder="e.g. Pulse Sorting, Oil Extraction, Spice Milling"
                        value={buyerData.procActivity}
                        onChange={(e) => setBuyerData((p) => ({ ...p, procActivity: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="FSSAI License / Registration (14 Digits)"
                        required
                        maxLength={14}
                        placeholder="e.g. 10020042000123"
                        value={buyerData.procFssaiNumber}
                        onChange={(e) => setBuyerData((p) => ({ ...p, procFssaiNumber: e.target.value }))}
                        helperText="Mandatory for commercial food processing facilities."
                      />
                      <FormInput
                        label="Processing Capacity per Month"
                        placeholder="e.g. 25 Metric Tonnes"
                        value={buyerData.procCapacity}
                        onChange={(e) => setBuyerData((p) => ({ ...p, procCapacity: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 5: Bakery or Food Business */}
                {buyerType === "Bakery or Food Business" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Bakery &amp; Commercial Kitchen Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Bakery / Restaurant Name"
                        required
                        placeholder="e.g. French Loaf Bakery & Kitchen"
                        value={buyerData.bakeryName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, bakeryName: e.target.value }))}
                      />
                      <FormSelect
                        label="Establishment Type"
                        value={buyerData.bakeryType}
                        onChange={(e) => setBuyerData((p) => ({ ...p, bakeryType: e.target.value }))}
                        options={["Commercial Bakery", "Restaurant / Hotel", "Cloud Kitchen", "Catering Service", "Confectionery"]}
                      />
                      <FormInput
                        label="FSSAI Food License (14 Digits)"
                        required
                        maxLength={14}
                        placeholder="e.g. 10020042000456"
                        value={buyerData.bakeryFssaiNumber}
                        onChange={(e) => setBuyerData((p) => ({ ...p, bakeryFssaiNumber: e.target.value }))}
                      />
                    </div>
                    <FormInput
                      label="Key Ingredients Required Regularly"
                      placeholder="e.g. Wheat Flour, Pure Butter, Seasonal Berries, Vanilla, Sugar"
                      value={buyerData.bakeryIngredients}
                      onChange={(e) => setBuyerData((p) => ({ ...p, bakeryIngredients: e.target.value }))}
                    />
                  </div>
                )}

                {/* Sub-form 6: Reseller */}
                {buyerType === "Reseller" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Mandi Reseller &amp; Retail Merchant Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Shop / Mandi Stall Name"
                        required
                        placeholder="e.g. Madurai Vegetable Mandi Stall No. 24"
                        value={buyerData.resellerShopName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, resellerShopName: e.target.value }))}
                      />
                      <FormSelect
                        label="Reseller Type"
                        value={buyerData.resellerType}
                        onChange={(e) => setBuyerData((p) => ({ ...p, resellerType: e.target.value }))}
                        options={["Mandi Wholesale Commission Agent", "Retail Grocery / Supermarket", "Vegetable Vendor Group", "Mobile Delivery Van"]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Daily Sourcing Volume"
                        value={buyerData.resellerDailyVolume}
                        onChange={(e) => setBuyerData((p) => ({ ...p, resellerDailyVolume: e.target.value }))}
                        options={["Under 5 Quintals / day", "5 - 15 Quintals / day", "15 - 50 Quintals / day", "50+ Quintals (Wholesale Bulk)"]}
                      />
                      <FormSelect
                        label="Payment Settlement Preference"
                        value={buyerData.resellerPaymentPreference}
                        onChange={(e) => setBuyerData((p) => ({ ...p, resellerPaymentPreference: e.target.value }))}
                        options={["Daily UPI / Cash Settlement", "Weekly Credit Settle", "Direct Bank Transfer"]}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 7: Other */}
                {buyerType === "Other" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Custom Institution / Buyer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Organization / Applicant Name"
                        required
                        placeholder="e.g. Sri Krishna Educational Trust Hostel"
                        value={buyerData.otherOrgName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, otherOrgName: e.target.value }))}
                      />
                      <FormInput
                        label="Applicant Category / Sector"
                        placeholder="e.g. Hostel, Temple Trust, NGO, Exporter"
                        value={buyerData.otherCategory}
                        onChange={(e) => setBuyerData((p) => ({ ...p, otherCategory: e.target.value }))}
                      />
                    </div>
                    <FormInput
                      label="Purpose of Agricultural Purchase"
                      placeholder="e.g. Daily meals procurement for 500 hostel students"
                      value={buyerData.otherPurpose}
                      onChange={(e) => setBuyerData((p) => ({ ...p, otherPurpose: e.target.value }))}
                    />
                  </div>
                )}

                {/* Common Location Details for Buyer */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Operating &amp; Delivery Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <FormSelect
                      label="District"
                      required
                      value={buyerData.district}
                      onChange={(e) => setBuyerData((p) => ({ ...p, district: e.target.value }))}
                      options={TAMIL_NADU_DISTRICTS}
                    />
                    <FormInput
                      label="City / Town"
                      placeholder="e.g. Pollachi"
                      value={buyerData.city}
                      onChange={(e) => setBuyerData((p) => ({ ...p, city: e.target.value }))}
                    />
                    <FormInput
                      label="PIN Code"
                      placeholder="e.g. 642001"
                      maxLength={6}
                      value={buyerData.pinCode}
                      onChange={(e) => setBuyerData((p) => ({ ...p, pinCode: e.target.value }))}
                    />
                  </div>
                  <FormInput
                    label="Full Delivery / Operating Street Address"
                    placeholder="e.g. Shop No. 12, Main Bazaar Road, Near Bus Stand"
                    value={buyerData.address}
                    onChange={(e) => setBuyerData((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ROLE: SELLER - 8 DYNAMIC SELLER TYPES                   */}
            {/* ======================================================== */}
            {role === "seller" && (
              <div className="space-y-6">
                {/* 8 Seller Types Selection Pills / Cards */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2.5">
                    Seller Classification <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SELLER_TYPES.map((type) => {
                      const isSelected = sellerType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSellerType(type)}
                          className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                            isSelected
                              ? "bg-[#174B35] text-white border-[#174B35] shadow-sm scale-[1.02]"
                              : "bg-gray-50/80 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/70"
                          }`}
                        >
                          <span className="leading-tight">{type}</span>
                          <span className={`text-[10px] mt-1 font-normal ${isSelected ? "text-emerald-200" : "text-gray-400"}`}>
                            {isSelected ? "● Active Form" : "Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-form 1: Farmer */}
                {sellerType === "Farmer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Direct Farmer &amp; Cultivator Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Farm Name (Optional)"
                        placeholder="e.g. Sri Murugan Thottam"
                        value={sellerData.farmerFarmName}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerFarmName: e.target.value }))}
                      />
                      <FormSelect
                        label="Cultivation Area / Land Size"
                        value={sellerData.farmerLandSize}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerLandSize: e.target.value }))}
                        options={["Under 2 Acres", "2 - 5 Acres", "5 - 10 Acres", "10 - 25 Acres", "25+ Acres"]}
                      />
                      <FormSelect
                        label="Farmer Category"
                        value={sellerData.farmerCategory}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerCategory: e.target.value }))}
                        options={["Landowner Farmer", "Tenant Cultivator", "Marginal Smallholder"]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">
                        Crops Cultivated <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_CROPS.map((crop) => {
                          const sel = sellerData.farmerCrops.includes(crop);
                          return (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => handleToggleArray(setSellerData, "farmerCrops", crop)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                sel ? "bg-[#174B35] text-white border-[#174B35]" : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              {sel ? `✓ ${crop}` : `+ ${crop}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Available Harvest Quantity"
                        placeholder="e.g. 50 Quintals / 10 Tonnes"
                        value={sellerData.farmerAvailableQty}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerAvailableQty: e.target.value }))}
                      />
                      <FormSelect
                        label="Harvest Season"
                        value={sellerData.farmerHarvestMonths}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerHarvestMonths: e.target.value }))}
                        options={["All Year", "Jan - Apr (Thai / Chithirai)", "May - Aug (Aadi)", "Sep - Dec (Karthigai)"]}
                      />
                      <FormSelect
                        label="Farming Method"
                        value={sellerData.farmerMethod}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerMethod: e.target.value }))}
                        options={["Conventional Farming", "Natural / Zero-Budget Farming", "Residue-Free"]}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 italic">
                      ✓ Small &amp; direct farmers are completely GST exempt. 0% platform fee on all crop trades.
                    </div>
                  </div>
                )}

                {/* Sub-form 2: Agricultural Producer (FPO / Society) */}
                {sellerType === "Agricultural Producer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>FPO &amp; Agricultural Cooperative Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="FPO / Society Legal Name"
                        required
                        placeholder="e.g. Kongu Uzhavar Producer Co Ltd"
                        value={sellerData.fpoName}
                        onChange={(e) => setSellerData((p) => ({ ...p, fpoName: e.target.value }))}
                      />
                      <FormSelect
                        label="Organization Structure"
                        value={sellerData.fpoStructure}
                        onChange={(e) => setSellerData((p) => ({ ...p, fpoStructure: e.target.value }))}
                        options={["Farmer Producer Company (FPC)", "Registered Cooperative Society", "Joint Liability Group (JLG)", "Self Help Group (SHG)"]}
                      />
                      <FormInput
                        label="Registration No (CIN / Society Reg)"
                        placeholder="e.g. U01409TZ2021PTC028491"
                        value={sellerData.fpoRegNumber}
                        onChange={(e) => setSellerData((p) => ({ ...p, fpoRegNumber: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Total Member Farmers"
                        value={sellerData.fpoMemberCount}
                        onChange={(e) => setSellerData((p) => ({ ...p, fpoMemberCount: e.target.value }))}
                        options={["50 - 200 Farmers", "200 - 500 Farmers", "500 - 1,500 Farmers", "1,500+ Farmers"]}
                      />
                      <FormInput
                        label="Combined Seasonal Supply Capacity"
                        placeholder="e.g. 150 Metric Tonnes"
                        value={sellerData.fpoCapacity}
                        onChange={(e) => setSellerData((p) => ({ ...p, fpoCapacity: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 3: Organic Producer */}
                {sellerType === "Organic Producer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Organic Certified Producer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Organic Farm / Brand Name"
                        required
                        placeholder="e.g. Pristine Nature Organic Farm"
                        value={sellerData.organicFarmName}
                        onChange={(e) => setSellerData((p) => ({ ...p, organicFarmName: e.target.value }))}
                      />
                      <FormSelect
                        label="Certification Status"
                        value={sellerData.organicCertStatus}
                        onChange={(e) => setSellerData((p) => ({ ...p, organicCertStatus: e.target.value }))}
                        options={["Certified Organic (NPOP)", "In-Conversion (C1 / C2)", "PGS-India Green / Organic", "Natural Farming (Uncertified)"]}
                      />
                      <FormInput
                        label="Certification Body"
                        placeholder="e.g. Aditi Organic, OneCert, PGS-India"
                        value={sellerData.organicCertAgency}
                        onChange={(e) => setSellerData((p) => ({ ...p, organicCertAgency: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Certificate Scope / License No"
                        placeholder="e.g. NPOP/NAB/0017/ORG-2024"
                        value={sellerData.organicScopeNumber}
                        onChange={(e) => setSellerData((p) => ({ ...p, organicScopeNumber: e.target.value }))}
                      />
                      <FormInput
                        label="Cultivation Practice"
                        placeholder="e.g. Vermicomposting, Jeevamrutham, No Chemical Input"
                        value={sellerData.organicMethod}
                        onChange={(e) => setSellerData((p) => ({ ...p, organicMethod: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 4: Raw-Material Provider */}
                {sellerType === "Raw-Material Provider" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Bulk Raw-Material Provider Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Provider / Business Name"
                        required
                        placeholder="e.g. Cauvery Raw Agri Commodities"
                        value={sellerData.rawProviderName}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawProviderName: e.target.value }))}
                      />
                      <FormSelect
                        label="Constitution"
                        value={sellerData.rawConstitution}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawConstitution: e.target.value }))}
                        options={["Proprietorship", "Partnership", "Private Limited", "LLP"]}
                      />
                      <FormInput
                        label="Stock Warehouse Capacity"
                        placeholder="e.g. 100 Metric Tonnes"
                        value={sellerData.rawStockCapacity}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawStockCapacity: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Raw Materials Supplied"
                        placeholder="e.g. Turmeric Bulbs, Coconut Copra, Castor Seeds"
                        value={sellerData.rawCommodities.join(", ")}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawCommodities: e.target.value.split(",") }))}
                      />
                      <FormInput
                        label="Minimum Order Quantity (MOQ)"
                        placeholder="e.g. 1 Metric Tonne"
                        value={sellerData.rawMoq}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawMoq: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 5: Ingredient Producer */}
                {sellerType === "Ingredient Producer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Agri-Ingredient Producer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Enterprise Name"
                        required
                        placeholder="e.g. Kongu Traditional Chekku Oils"
                        value={sellerData.ingProducerName}
                        onChange={(e) => setSellerData((p) => ({ ...p, ingProducerName: e.target.value }))}
                      />
                      <FormInput
                        label="FSSAI Food License (14 Digits)"
                        required
                        maxLength={14}
                        placeholder="e.g. 10020042000789"
                        value={sellerData.ingFssaiNumber}
                        onChange={(e) => setSellerData((p) => ({ ...p, ingFssaiNumber: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Ingredients Produced"
                        placeholder="e.g. Wood Pressed Oils, Dehydrated Onion Powder, Tamarind Paste"
                        value={sellerData.ingProducts}
                        onChange={(e) => setSellerData((p) => ({ ...p, ingProducts: e.target.value }))}
                      />
                      <FormInput
                        label="Extraction / Milling Technology"
                        placeholder="e.g. Cold-pressed wooden chekku, Air-dried"
                        value={sellerData.ingTechnology}
                        onChange={(e) => setSellerData((p) => ({ ...p, ingTechnology: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 6: Manufacturer */}
                {sellerType === "Manufacturer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Industrial Agro-Manufacturer Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Legal Company Name"
                        required
                        placeholder="e.g. Salem Agro Refineries Ltd"
                        value={sellerData.mfgSellerName}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgSellerName: e.target.value }))}
                      />
                      <FormSelect
                        label="Constitution"
                        value={sellerData.mfgSellerConstitution}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgSellerConstitution: e.target.value }))}
                        options={["Private Limited", "Public Limited", "Partnership", "LLP"]}
                      />
                      <FormInput
                        label="Finished Goods Manufactured"
                        placeholder="e.g. Refined Agri Oils, Cattle Feed Pellets"
                        value={sellerData.mfgProductsOffered}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgProductsOffered: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Local Farm Inputs Sourced"
                        placeholder="e.g. Groundnut pods, Cottonseed, Rice husk"
                        value={sellerData.mfgRawMaterialsUsed}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgRawMaterialsUsed: e.target.value }))}
                      />
                      <FormInput
                        label="Monthly Manufacturing Capacity"
                        placeholder="e.g. 200 Metric Tonnes"
                        value={sellerData.mfgCapacity}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgCapacity: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form 7: Value-Added Manufacturer */}
                {sellerType === "Value-Added Manufacturer" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Value-Added Food Products Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Brand / Enterprise Name"
                        required
                        placeholder="e.g. Madurai Traditional Pickles & Snacks"
                        value={sellerData.vaBrandName}
                        onChange={(e) => setSellerData((p) => ({ ...p, vaBrandName: e.target.value }))}
                      />
                      <FormInput
                        label="FSSAI License (14 Digits)"
                        required
                        maxLength={14}
                        placeholder="e.g. 10020042000999"
                        value={sellerData.vaFssaiNumber}
                        onChange={(e) => setSellerData((p) => ({ ...p, vaFssaiNumber: e.target.value }))}
                      />
                      <FormInput
                        label="Monthly Production Output"
                        placeholder="e.g. 5,000 kg"
                        value={sellerData.vaMonthlyCapacity}
                        onChange={(e) => setSellerData((p) => ({ ...p, vaMonthlyCapacity: e.target.value }))}
                      />
                    </div>
                    <FormInput
                      label="Value-Added Products Produced"
                      placeholder="e.g. Mango Pickles, Banana & Tapioca Chips, Roasted Millets"
                      value={sellerData.vaProducts}
                      onChange={(e) => setSellerData((p) => ({ ...p, vaProducts: e.target.value }))}
                    />
                  </div>
                )}

                {/* Sub-form 8: Other */}
                {sellerType === "Other" && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      <span>Specialized Farm Enterprise Form</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Enterprise Name"
                        required
                        placeholder="e.g. Thanjavur Coconut Saplings Nursery"
                        value={sellerData.otherSellerName}
                        onChange={(e) => setSellerData((p) => ({ ...p, otherSellerName: e.target.value }))}
                      />
                      <FormInput
                        label="Enterprise Activity"
                        placeholder="e.g. Grafted Fruit Saplings, Honey Apiculture, Mushrooms"
                        value={sellerData.otherActivity}
                        onChange={(e) => setSellerData((p) => ({ ...p, otherActivity: e.target.value }))}
                      />
                    </div>
                    <FormInput
                      label="Produce Available for Direct Sale"
                      placeholder="e.g. 5,000 TxD Hybrid Coconut Seedlings"
                      value={sellerData.otherProducts}
                      onChange={(e) => setSellerData((p) => ({ ...p, otherProducts: e.target.value }))}
                    />
                  </div>
                )}

                {/* Common Location Details for Seller */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Farm Gate / Collection Point Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <FormSelect
                      label="District"
                      required
                      value={sellerData.district}
                      onChange={(e) => setSellerData((p) => ({ ...p, district: e.target.value }))}
                      options={TAMIL_NADU_DISTRICTS}
                    />
                    <FormInput
                      label="Village / Taluk"
                      placeholder="e.g. Anaimalai"
                      value={sellerData.village}
                      onChange={(e) => setSellerData((p) => ({ ...p, village: e.target.value }))}
                    />
                    <FormInput
                      label="PIN Code"
                      placeholder="e.g. 642001"
                      maxLength={6}
                      value={sellerData.pinCode}
                      onChange={(e) => setSellerData((p) => ({ ...p, pinCode: e.target.value }))}
                    />
                  </div>
                  <FormInput
                    label="Farm Gate / Dispatch Point Address"
                    placeholder="e.g. Survey No. 42/B, Thottam Road, Post Box 12"
                    value={sellerData.farmAddress}
                    onChange={(e) => setSellerData((p) => ({ ...p, farmAddress: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/get-started"
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:text-gray-900 text-sm font-semibold transition-all"
              >
                &larr; Change Role
              </Link>
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-6 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Document Upload</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: DYNAMIC DOCUMENT VERIFICATION                    */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Step 2 of 4</span>
              </div>
              <h2 className="text-2xl font-black text-[#174B35] tracking-tight">
                Required Verification Documents
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload verification proofs required for your selected classification (
                <strong className="text-[#174B35]">{role === "buyer" ? buyerType : sellerType}</strong>). Allowed formats: PDF, JPG, PNG up to 5MB.
              </p>
            </div>

            <div className="space-y-4">
              {/* Common: Aadhaar / Government ID */}
              <DocumentUploader
                documentType="ID_PROOF"
                title="Identity Proof (Aadhaar Card / Voter ID / PAN)"
                description="Government identity proof of the account owner or registered farmer."
                required
                uploadedDoc={uploadedDocs["ID_PROOF"]}
                onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, ID_PROOF: doc }))}
                onRemove={() =>
                  setUploadedDocs((prev) => {
                    const next = { ...prev };
                    delete next.ID_PROOF;
                    return next;
                  })
                }
              />

              {/* Seller: Bank Account Proof for Direct Payments */}
              {role === "seller" && (
                <DocumentUploader
                  documentType="BANK_PASSBOOK"
                  title="Bank Account Passbook / Cancelled Cheque"
                  description="Required for direct farm-gate payments from buyers with 0% platform commission."
                  required
                  uploadedDoc={uploadedDocs["BANK_PASSBOOK"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, BANK_PASSBOOK: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.BANK_PASSBOOK;
                      return next;
                    })
                  }
                />
              )}

              {/* Farmer & Organic Producer: Land Records */}
              {role === "seller" && (sellerType === "Farmer" || sellerType === "Organic Producer") && (
                <DocumentUploader
                  documentType="LAND_PROOF"
                  title="Land Cultivation Record (Patta / Chitta / Uzhavar Card)"
                  description="Revenue record or Uzhavar card proving farm cultivation rights."
                  required={sellerType === "Farmer"}
                  uploadedDoc={uploadedDocs["LAND_PROOF"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, LAND_PROOF: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.LAND_PROOF;
                      return next;
                    })
                  }
                />
              )}

              {/* Organic Producer: Organic Certificate */}
              {role === "seller" && sellerType === "Organic Producer" && (
                <DocumentUploader
                  documentType="ORGANIC_CERTIFICATE"
                  title="Organic Certification Document (NPOP / PGS-India)"
                  description="Upload valid scope certificate from recognized organic accreditation agency."
                  required={sellerData.organicCertStatus.includes("Certified")}
                  uploadedDoc={uploadedDocs["ORGANIC_CERTIFICATE"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, ORGANIC_CERTIFICATE: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.ORGANIC_CERTIFICATE;
                      return next;
                    })
                  }
                />
              )}

              {/* Agricultural Producer: FPO / Society Reg */}
              {role === "seller" && sellerType === "Agricultural Producer" && (
                <DocumentUploader
                  documentType="FPO_CERTIFICATE"
                  title="FPO / Cooperative Registration Certificate"
                  description="Certificate of Incorporation or Society Registration proof."
                  required
                  uploadedDoc={uploadedDocs["FPO_CERTIFICATE"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, FPO_CERTIFICATE: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.FPO_CERTIFICATE;
                      return next;
                    })
                  }
                />
              )}

              {/* FSSAI Certificate if food processor / food business */}
              {isFssaiRequired && (
                <DocumentUploader
                  documentType="FSSAI_LICENSE"
                  title="FSSAI Food Safety License Certificate"
                  description="Mandatory state or central FSSAI registration certificate for food products."
                  required
                  uploadedDoc={uploadedDocs["FSSAI_LICENSE"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, FSSAI_LICENSE: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.FSSAI_LICENSE;
                      return next;
                    })
                  }
                />
              )}

              {/* GST Certificate if GST registered */}
              {isGstProvided && (
                <DocumentUploader
                  documentType="GST_CERTIFICATE"
                  title="GST Registration Certificate (Form REG-06)"
                  description="Upload certificate matching the 15-digit GSTIN provided."
                  required
                  uploadedDoc={uploadedDocs["GST_CERTIFICATE"]}
                  onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, GST_CERTIFICATE: doc }))}
                  onRemove={() =>
                    setUploadedDocs((prev) => {
                      const next = { ...prev };
                      delete next.GST_CERTIFICATE;
                      return next;
                    })
                  }
                />
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:text-gray-900 text-sm font-semibold transition-all cursor-pointer"
              >
                &larr; Back to Profile Details
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-6 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Review &amp; Submit</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: REVIEW & SUBMIT (NO SKIP PAYMENT BUTTON)         */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Step 3 of 4</span>
              </div>
              <h2 className="text-2xl font-black text-[#174B35] tracking-tight">
                Review &amp; Finalize Registration
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Verify your tailored profile details before activating direct trade on Ulavan Santhai.
              </p>
            </div>

            <div className="space-y-4">
              {/* Account Credentials */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Account Credentials (From Registration)
                </div>
                <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Full Name / Username:</span>
                    <strong className="text-gray-900">{userAuth.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Email Address:</span>
                    <strong className="text-gray-900">{userAuth.email}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Mobile Number:</span>
                    <strong className="text-gray-900">+91 {userAuth.mobile}</strong>
                  </div>
                </div>
              </div>

              {/* Dynamic Type-Specific Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {role === "buyer" ? `Buyer Classification: ${buyerType}` : `Seller Classification: ${sellerType}`}
                </div>

                {role === "buyer" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {buyerType === "Individual" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Commodities Needed:</span>
                          <strong className="text-[#174B35]">{buyerData.individualCommodities.join(", ")}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Consumption &amp; Frequency:</span>
                          <strong className="text-gray-900">{buyerData.individualVolume} • {buyerData.individualFrequency}</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Business" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Enterprise Name:</span>
                          <strong className="text-gray-900">{buyerData.businessName} ({buyerData.businessConstitution})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">GST Status:</span>
                          <strong className="text-gray-900">{buyerData.businessIsGst === "Yes" ? buyerData.businessGstin : "Unregistered"}</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Manufacturer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Company &amp; Sector:</span>
                          <strong className="text-gray-900">{buyerData.mfgCompanyName} • {buyerData.mfgCategory}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Raw Produce Required:</span>
                          <strong className="text-[#174B35]">{buyerData.mfgRawMaterials} ({buyerData.mfgVolume})</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Food Processor" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Mill Name &amp; Activity:</span>
                          <strong className="text-gray-900">{buyerData.procBusinessName} • {buyerData.procActivity}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">FSSAI License:</span>
                          <strong className="text-gray-900">{buyerData.procFssaiNumber}</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Bakery or Food Business" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Bakery Name &amp; Type:</span>
                          <strong className="text-gray-900">{buyerData.bakeryName} • {buyerData.bakeryType}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">FSSAI License:</span>
                          <strong className="text-gray-900">{buyerData.bakeryFssaiNumber}</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Reseller" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Mandi Shop / Stall:</span>
                          <strong className="text-gray-900">{buyerData.resellerShopName} • {buyerData.resellerType}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Daily Sourcing:</span>
                          <strong className="text-gray-900">{buyerData.resellerDailyVolume}</strong>
                        </div>
                      </>
                    )}
                    {buyerType === "Other" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Organization:</span>
                          <strong className="text-gray-900">{buyerData.otherOrgName} • {buyerData.otherCategory}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Buying Purpose:</span>
                          <strong className="text-gray-900">{buyerData.otherPurpose}</strong>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-gray-500 block text-xs">Operating District:</span>
                      <strong className="text-gray-900">{buyerData.district}, Tamil Nadu</strong>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {sellerType === "Farmer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Farm Name &amp; Land:</span>
                          <strong className="text-gray-900">{sellerData.farmerFarmName} ({sellerData.farmerLandSize})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Crops Cultivated:</span>
                          <strong className="text-[#174B35]">{sellerData.farmerCrops.join(", ")}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Harvest Capacity &amp; Method:</span>
                          <strong className="text-gray-900">{sellerData.farmerAvailableQty} • {sellerData.farmerMethod}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Agricultural Producer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">FPO / Cooperative:</span>
                          <strong className="text-gray-900">{sellerData.fpoName} ({sellerData.fpoStructure})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Registration &amp; Farmers:</span>
                          <strong className="text-gray-900">{sellerData.fpoRegNumber} • {sellerData.fpoMemberCount}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Organic Producer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Organic Farm:</span>
                          <strong className="text-gray-900">{sellerData.organicFarmName} • {sellerData.organicCertStatus}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Certification Agency:</span>
                          <strong className="text-gray-900">{sellerData.organicCertAgency}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Raw-Material Provider" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Provider Enterprise:</span>
                          <strong className="text-gray-900">{sellerData.rawProviderName} ({sellerData.rawStockCapacity})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">MOQ:</span>
                          <strong className="text-gray-900">{sellerData.rawMoq}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Ingredient Producer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Extraction Unit:</span>
                          <strong className="text-gray-900">{sellerData.ingProducerName} ({sellerData.ingCapacity})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">FSSAI License:</span>
                          <strong className="text-gray-900">{sellerData.ingFssaiNumber}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Manufacturer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Manufacturing Unit:</span>
                          <strong className="text-gray-900">{sellerData.mfgSellerName} • {sellerData.mfgCategory}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Monthly Output:</span>
                          <strong className="text-gray-900">{sellerData.mfgCapacity}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Value-Added Manufacturer" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Brand Name:</span>
                          <strong className="text-gray-900">{sellerData.vaBrandName} • {sellerData.vaProducts}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">FSSAI License:</span>
                          <strong className="text-gray-900">{sellerData.vaFssaiNumber}</strong>
                        </div>
                      </>
                    )}
                    {sellerType === "Other" && (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Specialized Enterprise:</span>
                          <strong className="text-gray-900">{sellerData.otherSellerName} • {sellerData.otherActivity}</strong>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-gray-500 block text-xs">Farm / Unit Location:</span>
                      <strong className="text-gray-900">{sellerData.village}, {sellerData.district}, Tamil Nadu</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Documents List */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Verification Documents Uploaded
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(uploadedDocs).map(([key, doc]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold"
                    >
                      ✓ {doc.fileName || key}
                    </span>
                  ))}
                  {Object.keys(uploadedDocs).length === 0 && (
                    <span className="text-xs text-gray-400">No documents attached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-[#174B35] focus:ring-[#174B35] border-gray-300 rounded cursor-pointer accent-[#174B35]"
                />
                <span className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                  I certify that the information entered above is genuine and accurate. I agree to trade on Ulavan Santhai following direct agricultural trade practices with 0% middleman margin.
                </span>
              </label>
            </div>

            {/* Action Bar (Stage 3 -> Stage 4 Handshake) */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:text-gray-900 text-sm font-semibold transition-all cursor-pointer"
              >
                &larr; Back to Documents
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="px-8 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Payment (Stage 4: ₹365)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: PAYMENT (₹365) - DEDICATED BUYER & SELLER VIEW   */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* If Payment Succeeded: Show Official Tax Receipt */}
            {paymentResult ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-10 space-y-6">
                {/* Success Banner */}
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200/70 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    <span>Payment Verified &amp; Success</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                    Payment Successful &amp; Profile Active!
                  </h2>
                  <p className="text-sm text-gray-600 max-w-lg mx-auto">
                    Your payment of <strong className="text-gray-900">₹{paymentResult.totalAmount}.00</strong> has been verified. Your verified trading credentials on Ulavan Santhai are now active with 0% middleman commission.
                  </p>
                </div>

                {/* Printable Official Receipt Card */}
                <div className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-gray-50/50 space-y-6" id="printable-receipt">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-black text-[#174B35]">Ulavan Santhai Agricultural Marketplace</h3>
                      <p className="text-xs text-gray-500">Official Membership &amp; Platform Access Receipt</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-gray-400 block uppercase">Invoice No</span>
                      <span className="font-mono text-sm font-black text-gray-900">{paymentResult.invoiceNumber}</span>
                    </div>
                  </div>

                  {/* Receipt Field Grid (BRD Stage 4 Specification) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Role Being Paid For</span>
                      <span className="font-bold text-gray-900 text-sm">{paymentResult.role}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Subscribed Plan</span>
                      <span className="font-bold text-[#174B35] text-sm">{paymentResult.planName}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Payment Status</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        ✓ {paymentResult.paymentStatus}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Transaction ID</span>
                      <span className="font-mono font-bold text-gray-900">{paymentResult.transactionId}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Gateway Reference</span>
                      <span className="font-mono font-bold text-gray-900">{paymentResult.gatewayReference}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Payment Date &amp; Time</span>
                      <span className="font-bold text-gray-900">{paymentResult.paymentDate}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Plan Validity Period</span>
                      <span className="font-bold text-gray-900">{paymentResult.planStartDate} to {paymentResult.planEndDate}</span>
                    </div>

                    {role === "seller" ? (
                      <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                        <span className="text-gray-500 block mb-1 font-semibold">Renewal Due Date</span>
                        <span className="font-bold text-amber-700">{paymentResult.renewalDueDate}</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-500 block mb-1 font-semibold">Buyer Seller-View Limit</span>
                          <span className="font-bold text-gray-900">{paymentResult.buyerViewLimit} Producers</span>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-500 block mb-1 font-semibold">Remaining Seller Views</span>
                          <span className="font-bold text-emerald-700">{paymentResult.buyerRemaining} Views Available</span>
                        </div>
                      </>
                    )}

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1 font-semibold">Payment Method</span>
                      <span className="font-bold text-gray-900">{paymentResult.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Base Membership Fee ({role === "buyer" ? "Annual Buyer Access" : "Monthly Seller Plan"})</span>
                      <span>₹{paymentResult.baseAmount}.00</span>
                    </div>
                    {paymentResult.addonAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Add-on Blocks ({paymentResult.addonBlocks} blocks of 10 sellers @ ₹10 each)</span>
                        <span>₹{paymentResult.addonAmount}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Tax Amount (GST @ 0% Agricultural Marketplace Exemption)</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-[#174B35] pt-2 border-t border-gray-100">
                      <span>Total Amount Paid</span>
                      <span>₹{paymentResult.totalAmount}.00 INR</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print / Save Receipt</span>
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href="/onboarding/status"
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-[#174B35] text-[#174B35] hover:bg-[#174B35]/5 text-xs sm:text-sm font-bold text-center transition-all"
                    >
                      View Status
                    </Link>
                    <Link
                      href={`/dashboard?role=${role}&paid=true`}
                      className="flex-1 sm:flex-initial px-7 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                    >
                      <span>Go to Dashboard</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Dedicated Buyer & Seller Payment View matching reference mockup */
              <div className="space-y-6">
                {/* Header Title & Subtitle */}
                <div className="text-center space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {role === "buyer" ? "Buyer Membership Payment" : "Seller Subscription Payment"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                    {role === "buyer"
                      ? "Get access to explore and connect with trusted sellers."
                      : "Continue as a verified seller and showcase your products."}
                  </p>
                </div>

                {/* 3-Step Progress Stepper */}
                <div className="max-w-md mx-auto flex items-center justify-between px-4 sm:px-8 py-2">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#2B563D] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700 mt-1.5 whitespace-nowrap">
                      {role === "buyer" ? "Choose Plan" : "Complete Onboarding"}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#2B563D] mx-2 -mt-5" />

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#2B563D] text-white flex items-center justify-center text-xs font-bold ring-4 ring-[#2B563D]/20 shadow-xs">
                      2
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#2B563D] mt-1.5 whitespace-nowrap">
                      Payment
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-5" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-400 bg-white flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-400 mt-1.5 whitespace-nowrap">
                      {role === "buyer" ? "Access Granted" : "Start Selling"}
                    </span>
                  </div>
                </div>

                {/* Main Payment Container Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Column: Plan Card */}
                    <div className="lg:col-span-7 bg-[#F4F7F2] border border-gray-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <span className="inline-block px-3.5 py-1 rounded-full bg-[#2B563D] text-white text-xs font-semibold tracking-wide">
                            {role === "buyer" ? "Buyer Plan" : "Seller Plan"}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-extrabold text-gray-900">₹365</span>
                            <span className="text-xs text-gray-500 font-medium block mt-0.5">
                              {role === "buyer" ? "/ Year" : "/ Month"}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                          {role === "buyer" ? "Access up to 10 Sellers" : "Seller Subscription"}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {role === "buyer"
                            ? "Explore products and connect with trusted sellers on our platform."
                            : "List and manage your products on UlavanSanthai."}
                        </p>

                        <div className="pt-2 space-y-2.5">
                          {(role === "buyer"
                            ? [
                                "Search & Explore Products",
                                "Connect with Sellers",
                                "Safe & Trusted Platform",
                              ]
                            : [
                                "Add Products & Showcase",
                                "Manage Your Business",
                                "Reach More Buyers",
                              ]
                          ).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800">
                              <span className="w-4 h-4 rounded-full bg-[#2B563D] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                                ✓
                              </span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subtle Bottom-Right Leaf Watermark */}
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-20 pointer-events-none text-[#2B563D]">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                          <path d="M50 0 C60 30, 90 40, 100 50 C70 60, 60 90, 50 100 C40 70, 10 60, 0 50 C30 40, 40 10, 50 0 Z" />
                          <path d="M50 10 L50 90 M50 30 L70 20 M50 50 L80 40 M50 70 L70 60 M50 30 L30 20 M50 50 L20 40 M50 70 L30 60" stroke="#1E3E2B" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    </div>

                    {/* Right Column: Payment Summary */}
                    <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 tracking-tight">Payment Summary</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center text-gray-600">
                            <span>{role === "buyer" ? "Plan Amount" : "Subscription Fee"}</span>
                            <span className="font-bold text-gray-900">₹365</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Tax (if applicable)</span>
                            <span className="font-bold text-gray-900">₹0</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                            <span className="text-base font-bold text-gray-900">Total Payable</span>
                            <span className="text-2xl sm:text-3xl font-black text-gray-900">₹365</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={handleInitiateRazorpay}
                          className="w-full py-3.5 px-6 rounded-xl bg-[#2B563D] hover:bg-[#1E3E2B] text-white font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Connecting to Razorpay...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Pay ₹365 Now</span>
                              <span className="text-lg font-bold">&rarr;</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 text-[#2B563D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Secure payment via Razorpay</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full-width Info Banner */}
                  <div className="bg-[#F4F7F2] border border-gray-200/60 rounded-xl p-3 sm:p-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You will be redirected to Razorpay&apos;s secure payment page</span>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <span>&larr;</span>
                      <span>Back</span>
                    </button>
                  </div>
                </div>

                {/* Razorpay Interactive Simulation Modal (For Development / Preview Mode) */}
                {isRazorpayModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#0C2340] text-white flex items-center justify-center font-black text-sm">
                            R
                          </div>
                          <span className="font-black text-gray-900 text-sm">Razorpay Checkout</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsRazorpayModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="py-6 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0C2340] flex items-center justify-center mx-auto">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">Ulavan Santhai Platform Access</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {role === "buyer" ? "Buyer Verified Plan (10 Sellers)" : "Seller Monthly Membership Plan"}
                          </p>
                          <div className="text-3xl font-black text-[#174B35] mt-2">
                            ₹{365 + (role === "buyer" ? addonBlocks * 10 : 0)}.00
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                          ⚡ <strong>Razorpay Gateway Ready</strong>: Choose to simulate a live successful payment transaction or cancel.
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleFinalizePayment(`pay_rzp_mock_${Date.now().toString().slice(-8)}`)}
                          className="w-full py-3.5 px-4 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>Complete &amp; Simulate Successful Payment</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsRazorpayModalOpen(false)}
                          className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Cancel Transaction
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#174B35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
