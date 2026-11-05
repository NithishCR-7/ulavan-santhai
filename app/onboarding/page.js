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
import { useSessionUser } from "@/services/sessionAuth";
import { checkRolePaymentStatus } from "@/services/paymentApi";

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
  const isApprovedParam = searchParams.get("approved") === "true";
  const [role, setRole] = useState(roleParam === "seller" ? "seller" : "buyer");

  // Payment review status check (Stage 4 & 5 verification)
  const [paymentStatus] = useState(() => {
    if (isApprovedParam) return { approved: true, status: "APPROVED" };
    return checkRolePaymentStatus(roleParam);
  });

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

  // Final Submission
  const handleSubmit = async () => {
    if (!termsAgreed) {
      setFormError("Please verify and accept the fair trade marketplace declaration.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    const applicationId = `US_${role.toUpperCase()}_${Date.now().toString().slice(-6)}`;

    const fullPayload = {
      applicationId,
      role: role.toUpperCase(),
      account: userAuth,
      subType: role === "buyer" ? buyerType : sellerType,
      profile: role === "buyer" ? buyerData : sellerData,
      documents: uploadedDocs,
      status: "active",
      submittedAt: new Date().toISOString(),
    };

    try {
      await submitApplication(fullPayload);

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
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_latest_app_id", applicationId);
      }

      setTimeout(() => {
        if (role === "seller") {
          router.push(`/seller/dashboard?id=${applicationId}`);
        } else {
          router.push(`/dashboard?role=buyer&id=${applicationId}`);
        }
      }, 1000);
    } catch {
      setFormError("Submission failed. Please check your network and retry.");
      setIsSubmitting(false);
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
        {/* Banner: Logged in credentials */}
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

        {/* Stepper Component (3 Steps) */}
        <Stepper
          currentStep={currentStep}
          steps={steps}
          onStepClick={(s) => {
            if (s < currentStep) setCurrentStep(s);
          }}
        />

        {/* Stage 4 & 5 Status Notice */}
        {!paymentStatus.approved && !isApprovedParam ? (
          <div className="mb-6 p-5 rounded-3xl bg-amber-50 border border-amber-300 shadow-2xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-950">
                Stage 4 &amp; 5 Required: Role Membership Payment (₹365)
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              As required by UlavanSanthai policy, membership payment must be initiated immediately after role selection before proceeding with detailed business credentials.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/onboarding/payment?role=${role}`}
                className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Complete {role === "seller" ? "Seller" : "Buyer"} Payment (₹365) &rarr;
              </Link>
              <Link
                href={`/onboarding/status?role=${role}`}
                className="px-4 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 text-xs font-bold transition-colors"
              >
                Check Payment Review Status &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>
                <strong>Stage 5 Cleared:</strong> ₹365 {role === "seller" ? "Seller" : "Buyer"} Membership verified. Proceed with Stage 5B detailed onboarding.
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
              ✓ Stage 5 Cleared
            </span>
          </div>
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
                <span>Step 1 of 3</span>
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
                <span>Step 2 of 3</span>
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
                <span>Step 3 of 3</span>
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

            {/* Action Bar (Strictly NO SKIP PAYMENT BUTTON) */}
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
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-8 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Activate {role === "buyer" ? buyerType : sellerType} Profile</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
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
