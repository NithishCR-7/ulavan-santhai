"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductImageUploader from "@/components/seller/ProductImageUploader";
import ProductPreviewModal from "@/components/seller/ProductPreviewModal";
import { getLocalSellerProfile } from "@/services/sellerApi";
import { createSellerProduct } from "@/services/productApi";

// Agricultural Product Categories based on BRD & project schema
const PRODUCT_CATEGORIES = [
  "Vegetables & Tubers",
  "Fruits",
  "Grains & Millets",
  "Spices & Condiments",
  "Pulses & Legumes",
  "Oils & Oilseeds",
  "Plantation & Commercial Crops",
  "Organic & Natural Produce",
  "Processed & Value Added",
];

const QUANTITY_UNITS = [
  "kg",
  "quintal",
  "metric tonne",
  "bag (50kg)",
  "bag (25kg)",
  "litre",
  "piece / bunch",
];

const QUALITY_GRADES = [
  "Grade A (Export Quality)",
  "Grade A (Premium)",
  "Grade B (Standard Commercial)",
  "Grade C (Processing Grade)",
];

const ORGANIC_STATUSES = [
  "Conventional Farming",
  "Certified Organic (NPOP / Jaivik Bharat)",
  "In Conversion to Organic",
  "Natural / Chemical-Free Farming",
];

const AVAILABILITY_STATUSES = [
  { value: "IN_STOCK", label: "In Stock (Ready for Dispatch)" },
  { value: "HARVEST_READY", label: "Harvest Ready (Within 7 Days)" },
  { value: "PRE_ORDER", label: "Pre-Order / Advance Booking" },
  { value: "SEASONAL", label: "Seasonal Harvest" },
];

export default function AddProductPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reused Seller Profile & Location (Zero duplicate onboarding re-entry)
  const [sellerProfile] = useState(() => getLocalSellerProfile());

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Basic Info
    title: "",
    category: "Vegetables & Tubers",
    subcategory: "",
    description: "",
    images: [],

    // Section B: Specifications
    variety: "",
    grade: "Grade A (Premium)",
    specifications: "",
    organicStatus: sellerProfile?.sellerType?.toLowerCase().includes("organic")
      ? "Certified Organic (NPOP / Jaivik Bharat)"
      : "Conventional Farming",
    certificationDetails:
      sellerProfile?.sellerData?.organicCertStatus ||
      sellerProfile?.sellerData?.organicScopeNumber ||
      "",

    // Classification Contextual Fields
    farmingMethod: sellerProfile?.sellerData?.farmerMethod || "",
    harvestSeason: sellerProfile?.sellerData?.farmerHarvestMonths || "All Year",
    aggregatedSupply:
      sellerProfile?.sellerData?.fpoMemberCount
        ? `Aggregated supply from ${sellerProfile.sellerData.fpoMemberCount} member farmers`
        : "",
    rawCommodityGrade: "",
    processingMethod: sellerProfile?.sellerData?.ingTechnology || "",
    shelfLife: sellerProfile?.sellerData?.vaShelfLife || "",
    packagingType: sellerProfile?.sellerData?.vaPackaging || "50kg Jute Gunny Bags",
    fssaiLicense: sellerProfile?.sellerData?.ingFssaiNumber || sellerProfile?.sellerData?.vaFssaiNumber || "",

    // Section C: Quantity, Pricing & Availability
    availableStock: "",
    unit: "kg",
    minOrderQuantity: "",
    moqUnit: "kg",
    pricePerUnit: "",
    availabilityStatus: "IN_STOCK",
    harvestDate: "",

    // Section D: Origin Location (defaulted to seller onboarding)
    originDistrict: sellerProfile?.district || "Coimbatore",
    originState: "Tamil Nadu",
    originLocation: sellerProfile?.farmAddress || sellerProfile?.village || "Anaimalai",
    isCustomOrigin: false,
    customDispatchAddress: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      harvestDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const sellerClassification = sellerProfile?.sellerType || "Farmer";

  // Field change handler that clears errors
  const handleChange = (field, value) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const validateForm = (isDraft = false) => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Product title is required.";
    }

    if (!isDraft) {
      if (!formData.category) {
        errors.category = "Please select a product category.";
      }
      if (!formData.description.trim()) {
        errors.description = "Please provide a short description of your produce.";
      }
      if (!formData.availableStock || Number(formData.availableStock) <= 0) {
        errors.availableStock = "Enter valid available quantity.";
      }
      if (!formData.minOrderQuantity || Number(formData.minOrderQuantity) <= 0) {
        errors.minOrderQuantity = "Enter valid minimum order quantity (MOQ).";
      }
      if (!formData.pricePerUnit || Number(formData.pricePerUnit) <= 0) {
        errors.pricePerUnit = "Enter valid price per unit.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save as Draft
  const handleSaveDraft = async () => {
    if (!validateForm(true)) return;

    setIsSubmitting(true);
    try {
      const res = await createSellerProduct(formData, true);
      if (res.success) {
        setSubmitSuccess({
          type: "DRAFT",
          message: "Product saved as Draft. You can complete and submit it whenever you are ready.",
        });
      }
    } catch (err) {
      console.error("Draft save failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit for Review
  const handleSubmitForReview = async () => {
    if (!validateForm(false)) return;

    setIsSubmitting(true);
    try {
      const res = await createSellerProduct(formData, false);
      if (res.success) {
        setIsPreviewOpen(false);
        setSubmitSuccess({
          type: "SUBMITTED",
          message: "Your agricultural product listing has been submitted for quality review.",
        });
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Top Header */}
      <SellerHeader
        sellerName={sellerProfile?.name}
        sellerType={sellerProfile?.sellerType}
        farmName={sellerProfile?.sellerData?.farmerFarmName || sellerProfile?.farmName}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Left Sidebar */}
        <SellerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/seller/products"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-[#174B35] hover:text-[#103A29] text-xs font-bold hover:border-[#174B35]/40 transition-all shadow-2xs"
              >
                <span>&larr;</span>
                <span>Back to My Products</span>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs font-semibold text-gray-500">New Produce Listing</span>
            </div>

            {/* Seller Classification Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold border border-[#729B59]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#729B59]" />
              <span>Listing as: {sellerClassification}</span>
            </div>
          </div>

          {/* Page Heading Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight">
                Add a Product
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Add details about the agricultural product you want to sell so commercial buyers can discover it.
              </p>
            </div>
          </div>

          {/* Submission Success Banner */}
          {submitSuccess && (
            <div className="p-6 rounded-3xl bg-[#E8F0E3] border border-[#729B59]/40 text-[#174B35] shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#174B35] text-white flex items-center justify-center shrink-0 font-bold text-lg">
                  &#10003;
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {submitSuccess.type === "DRAFT" ? "Draft Saved Successfully!" : "Product Listing Submitted!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    {submitSuccess.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {submitSuccess.type === "SUBMITTED"
                      ? "⏳ Verification is typically completed by UlavanSanthai admin within 2 to 4 business hours."
                      : "You can find this draft anytime under your My Products section."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/seller/products"
                  className="px-4 py-2 rounded-xl bg-[#174B35] text-white font-bold text-xs hover:bg-[#103A29] shadow-xs transition-colors"
                >
                  View My Products &rarr;
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(null);
                    setFormData((prev) => ({
                      ...prev,
                      title: "",
                      description: "",
                      availableStock: "",
                      pricePerUnit: "",
                      minOrderQuantity: "",
                      images: [],
                    }));
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  + Add Another Product
                </button>
              </div>
            </div>
          )}

          {/* Add Product Main Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitForReview();
            }}
            className="space-y-8"
          >
            {/* SECTION A – Basic Product Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold text-sm shrink-0">
                  A
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#174B35]">
                    Basic Product Information
                  </h2>
                  <p className="text-xs text-gray-500">
                    Essential details to identify and showcase your produce in the marketplace
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Product / Crop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Salem High-Curcumin Turmeric Finger, PKM-1 Country Tomatoes"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35] ${
                      formErrors.title ? "border-red-400 bg-red-50/30" : "border-gray-300"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{formErrors.title}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    Use a clear name including variety or grade if known.
                  </p>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Product Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory / Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Subcategory / Produce Type <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => handleChange("subcategory", e.target.value)}
                    placeholder="e.g. Root Vegetable, Dried Spice, Cold-Pressed Oil"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe your produce: harvest date, color, moisture percentage, aroma, grading standard, packaging methods, and trade suitability..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35] ${
                      formErrors.description ? "border-red-400 bg-red-50/30" : "border-gray-300"
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Product Images Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Produce Photographs / Images <span className="text-gray-400 text-xs font-normal">(Recommended)</span>
                  </label>
                  <ProductImageUploader
                    images={formData.images}
                    onChange={(imgs) => handleChange("images", imgs)}
                    maxImages={4}
                  />
                </div>
              </div>
            </div>

            {/* SECTION B – Product Specifications */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold text-sm shrink-0">
                  B
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#174B35]">
                    Product Specifications
                  </h2>
                  <p className="text-xs text-gray-500">
                    Quality grading, variety, and classification-specific cultivation attributes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Variety */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Variety / Cultivar
                  </label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => handleChange("variety", e.target.value)}
                    placeholder="e.g. Salem Local, PKM-1, Sona Masoori, Robusta"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Quality Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {QUALITY_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Organic Status */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Organic / Farming Status
                  </label>
                  <select
                    value={formData.organicStatus}
                    onChange={(e) => handleChange("organicStatus", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {ORGANIC_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size / Physical Specifications */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Size / Physical Specifications <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specifications}
                    onChange={(e) => handleChange("specifications", e.target.value)}
                    placeholder="e.g. Size 45mm+, Moisture content < 10%, Sun-dried on concrete floor"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                {/* ================= CLASSIFICATION SPECIFIC FIELDS ================= */}
                {/* 1. Farmer Specific */}
                {sellerClassification.toLowerCase().includes("farmer") && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Farming Method
                      </label>
                      <input
                        type="text"
                        value={formData.farmingMethod}
                        onChange={(e) => handleChange("farmingMethod", e.target.value)}
                        placeholder="e.g. Drip Irrigated, Traditional, Zero-Budget"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Harvest Season
                      </label>
                      <input
                        type="text"
                        value={formData.harvestSeason}
                        onChange={(e) => handleChange("harvestSeason", e.target.value)}
                        placeholder="e.g. Kharif (Oct - Dec), All Year"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                  </>
                )}

                {/* 2. FPO / Producer Group Specific */}
                {sellerClassification.toLowerCase().includes("producer") && !sellerClassification.toLowerCase().includes("organic") && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                      Aggregated Supply Details
                    </label>
                    <input
                      type="text"
                      value={formData.aggregatedSupply}
                      onChange={(e) => handleChange("aggregatedSupply", e.target.value)}
                      placeholder="e.g. Combined harvest from 150+ member farmers across Anaimalai block"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>
                )}

                {/* 3. Organic Producer Specific */}
                {sellerClassification.toLowerCase().includes("organic") && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                      Organic Certification &amp; Scope Details
                    </label>
                    <input
                      type="text"
                      value={formData.certificationDetails}
                      onChange={(e) => handleChange("certificationDetails", e.target.value)}
                      placeholder="e.g. Aditi Organic Certifications / NPOP Scope #0017-2024"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>
                )}

                {/* 4. Raw Material Provider Specific */}
                {sellerClassification.toLowerCase().includes("raw") && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Commodity Grade
                      </label>
                      <input
                        type="text"
                        value={formData.rawCommodityGrade}
                        onChange={(e) => handleChange("rawCommodityGrade", e.target.value)}
                        placeholder="e.g. Industrial Bulk Grade, Moisture < 8%"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Storage &amp; Packaging Specs
                      </label>
                      <input
                        type="text"
                        value={formData.packagingType}
                        onChange={(e) => handleChange("packagingType", e.target.value)}
                        placeholder="e.g. 50kg Jute Gunny Bags, Ventilated Crates"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                  </>
                )}

                {/* 5. Ingredient / Manufacturer / Value-Added Specific */}
                {(sellerClassification.toLowerCase().includes("ingredient") ||
                  sellerClassification.toLowerCase().includes("manufacturer") ||
                  sellerClassification.toLowerCase().includes("value")) && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Processing / Extraction Method
                      </label>
                      <input
                        type="text"
                        value={formData.processingMethod}
                        onChange={(e) => handleChange("processingMethod", e.target.value)}
                        placeholder="e.g. Wooden Chekku Cold Pressed, Low-Temp Milling"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Shelf Life / Preservation
                      </label>
                      <input
                        type="text"
                        value={formData.shelfLife}
                        onChange={(e) => handleChange("shelfLife", e.target.value)}
                        placeholder="e.g. 6 Months, 12 Months from packaging"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                        Packaging Format
                      </label>
                      <input
                        type="text"
                        value={formData.packagingType}
                        onChange={(e) => handleChange("packagingType", e.target.value)}
                        placeholder="e.g. Glass Jars, 5L HDPE Cans, Multi-layer Pouches"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SECTION C – Quantity and Availability */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold text-sm shrink-0">
                  C
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#174B35]">
                    Quantity, Pricing &amp; Availability
                  </h2>
                  <p className="text-xs text-gray-500">
                    Specify available stock, minimum commercial order size, and pricing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Available Quantity */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Available Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formData.availableStock}
                    onChange={(e) => handleChange("availableStock", e.target.value)}
                    placeholder="e.g. 2500"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35] ${
                      formErrors.availableStock ? "border-red-400 bg-red-50/30" : "border-gray-300"
                    }`}
                  />
                  {formErrors.availableStock && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{formErrors.availableStock}</p>
                  )}
                </div>

                {/* Quantity Unit */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Quantity Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => {
                      handleChange("unit", e.target.value);
                      if (!formData.moqUnit) handleChange("moqUnit", e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price per Unit */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Price per Unit (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={formData.pricePerUnit}
                      onChange={(e) => handleChange("pricePerUnit", e.target.value)}
                      placeholder="e.g. 140"
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35] ${
                        formErrors.pricePerUnit ? "border-red-400 bg-red-50/30" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {formErrors.pricePerUnit && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{formErrors.pricePerUnit}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">₹ per {formData.unit}</p>
                </div>

                {/* Minimum Order Quantity (MOQ) */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Min Order Quantity (MOQ) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={formData.minOrderQuantity}
                      onChange={(e) => handleChange("minOrderQuantity", e.target.value)}
                      placeholder="e.g. 50"
                      className={`w-full px-3 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35] ${
                        formErrors.minOrderQuantity ? "border-red-400 bg-red-50/30" : "border-gray-300"
                      }`}
                    />
                    <select
                      value={formData.moqUnit}
                      onChange={(e) => handleChange("moqUnit", e.target.value)}
                      className="px-2 py-3 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white"
                    >
                      {QUANTITY_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.minOrderQuantity && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{formErrors.minOrderQuantity}</p>
                  )}
                </div>

                {/* Availability Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Availability Status
                  </label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) => handleChange("availabilityStatus", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {AVAILABILITY_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harvest / Dispatch Date */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                    Expected Dispatch / Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleChange("harvestDate", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION D – Product Origin & Location */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold text-sm shrink-0">
                  D
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#174B35]">
                    Product Origin &amp; Dispatch Location
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pre-filled from your registered seller profile with option for alternative source location
                  </p>
                </div>
              </div>

              {/* Default Registered Location Notice */}
              <div className="p-4 rounded-2xl bg-[#F5F5EB] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-800 block text-sm">
                    Default Origin: {formData.originLocation}, {formData.originDistrict} District
                  </span>
                  <span className="text-gray-500">
                    Sourced from your registered farm/facility in {formData.originState}.
                  </span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-emerald-800">Verified Address</span>
                </div>
              </div>

              {/* Different Origin Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="isCustomOrigin"
                  type="checkbox"
                  checked={formData.isCustomOrigin}
                  onChange={(e) => handleChange("isCustomOrigin", e.target.checked)}
                  className="w-4 h-4 text-[#174B35] rounded border-gray-300 focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                />
                <label htmlFor="isCustomOrigin" className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer">
                  Dispatched from a different warehouse, storage, or collection point
                </label>
              </div>

              {formData.isCustomOrigin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Dispatch District
                    </label>
                    <input
                      type="text"
                      value={formData.originDistrict}
                      onChange={(e) => handleChange("originDistrict", e.target.value)}
                      placeholder="e.g. Erode, Salem, Tirupur"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Warehouse / Dispatch Location Address
                    </label>
                    <input
                      type="text"
                      value={formData.customDispatchAddress}
                      onChange={(e) => handleChange("customDispatchAddress", e.target.value)}
                      placeholder="e.g. Central Cold Storage Unit, Kangeyam Road"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Actions Bar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-[#174B35] text-[#174B35] hover:bg-[#E8F0E3]/50 font-black text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview Listing</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>

              <div className="w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Review</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        product={formData}
        onConfirmSubmit={handleSubmitForReview}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
