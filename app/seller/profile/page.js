"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerBusinessCard from "@/components/seller/SellerBusinessCard";
import FormInput from "@/components/onboarding/FormInput";
import FormSelect from "@/components/onboarding/FormSelect";
import { getSellerProfile, updateSellerProfile } from "@/services/sellerApi";

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

const SELLER_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other"
];

const COMMON_CROPS = [
  "Coconut", "Banana", "Turmeric", "Paddy / Rice", "Millets",
  "Tomato", "Onion", "Tapioca", "Groundnut", "Cotton", "Tea", "Cardamom"
];

export default function SellerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await getSellerProfile();
      if (res && res.data) {
        setProfile(res.data);
        setFormData({
          sellerType: res.data.sellerType || "Farmer",
          district: res.data.district || "Coimbatore",
          village: res.data.village || "Anaimalai",
          pinCode: res.data.pinCode || "642001",
          farmAddress: res.data.farmAddress || "No. 12, Thottam Road, Anaimalai",
          sellerData: {
            ...res.data.sellerData,
          },
        });
      }
    }
    loadProfile();
  }, []);

  const handleToggleCrop = (crop) => {
    setFormData((prev) => {
      const currentCrops = prev.sellerData?.farmerCrops || [];
      const updated = currentCrops.includes(crop)
        ? currentCrops.filter((c) => c !== crop)
        : [...currentCrops, crop];
      return {
        ...prev,
        sellerData: {
          ...prev.sellerData,
          farmerCrops: updated,
        },
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const updatedProfile = {
        ...profile,
        sellerType: formData.sellerType,
        district: formData.district,
        village: formData.village,
        pinCode: formData.pinCode,
        farmAddress: formData.farmAddress,
        sellerData: {
          ...profile.sellerData,
          ...formData.sellerData,
          district: formData.district,
          village: formData.village,
          pinCode: formData.pinCode,
          farmAddress: formData.farmAddress,
        },
      };

      await updateSellerProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSaveSuccessMsg("Seller profile updated successfully! All changes are synchronized with your active session.");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !formData) {
    return (
      <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#174B35] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading Seller Profile...</p>
        </div>
      </div>
    );
  }

  const currentType = formData.sellerType || "Farmer";

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Top Header */}
      <SellerHeader
        sellerName={profile.name}
        sellerType={profile.sellerType}
        farmName={profile.farmName}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Left Sidebar */}
        <SellerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/seller/dashboard" className="hover:text-[#174B35] font-semibold">
              Seller Dashboard
            </Link>
            <span>&bull;</span>
            <span className="font-bold text-gray-900">Seller Business Profile</span>
          </div>

          {/* Success Notification Banner */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-150">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* View Mode: Clean Onboarding Summary Card */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-[#174B35] tracking-tight">
                    Seller Profile &amp; Verification
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    View and manage your registered agricultural business information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Business Details</span>
                </button>
              </div>

              {/* Comprehensive Onboarding Business Summary */}
              <SellerBusinessCard sellerInfo={profile} showEditButton={false} />
            </div>
          ) : (
            /* Edit Mode: Reuses the exact Onboarding fields */
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Edit Seller Business Profile
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Updates reuse your existing onboarding data without duplicate database fields.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* 1. Seller Classification Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Seller Classification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SELLER_TYPES.map((type) => {
                    const isSelected = formData.sellerType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, sellerType: type })}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#174B35] text-white border-[#174B35] shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Common Operating Location */}
              <div className="p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/70 space-y-4">
                <h3 className="text-xs font-bold text-[#174B35] uppercase tracking-wider">
                  Farm / Operating Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <FormInput
                      label="Farm / Enterprise Address"
                      value={formData.farmAddress}
                      onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                      placeholder="e.g. No. 12, Thottam Road"
                      required
                    />
                  </div>
                  <div>
                    <FormSelect
                      label="District (Tamil Nadu)"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      options={TAMIL_NADU_DISTRICTS}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Village / Town / Ward"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Anaimalai"
                    required
                  />
                  <FormInput
                    label="Postal PIN Code"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="e.g. 642001"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* 3. Classification Specific Fields */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-4">
                <h3 className="text-xs font-bold text-[#174B35] uppercase tracking-wider">
                  {currentType} Specifications
                </h3>

                {/* Farmer Sub-form */}
                {currentType === "Farmer" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="Farm Name"
                        value={formData.sellerData.farmerFarmName || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          sellerData: { ...formData.sellerData, farmerFarmName: e.target.value },
                        })}
                        placeholder="e.g. Sri Murugan Thottam"
                      />
                      <FormSelect
                        label="Cultivation Area / Land Size"
                        value={formData.sellerData.farmerLandSize || "2 - 5 Acres"}
                        onChange={(e) => setFormData({
                          ...formData,
                          sellerData: { ...formData.sellerData, farmerLandSize: e.target.value },
                        })}
                        options={["Under 2 Acres", "2 - 5 Acres", "5 - 10 Acres", "10 - 25 Acres", "25+ Acres"]}
                      />
                      <FormSelect
                        label="Farmer Category"
                        value={formData.sellerData.farmerCategory || "Landowner Farmer"}
                        onChange={(e) => setFormData({
                          ...formData,
                          sellerData: { ...formData.sellerData, farmerCategory: e.target.value },
                        })}
                        options={["Landowner Farmer", "Tenant Cultivator", "Marginal Smallholder"]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Primary Crops Cultivated
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_CROPS.map((crop) => {
                          const isSel = (formData.sellerData.farmerCrops || []).includes(crop);
                          return (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => handleToggleCrop(crop)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSel ? "bg-[#174B35] text-white border-[#174B35]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {isSel ? `✓ ${crop}` : `+ ${crop}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Harvest Season"
                        value={formData.sellerData.farmerHarvestMonths || "All Year"}
                        onChange={(e) => setFormData({
                          ...formData,
                          sellerData: { ...formData.sellerData, farmerHarvestMonths: e.target.value },
                        })}
                        options={["All Year", "Jan - Apr (Thai / Chithirai)", "May - Aug (Aadi)", "Sep - Dec (Karthigai)"]}
                      />
                      <FormSelect
                        label="Farming Method"
                        value={formData.sellerData.farmerMethod || "Conventional Farming"}
                        onChange={(e) => setFormData({
                          ...formData,
                          sellerData: { ...formData.sellerData, farmerMethod: e.target.value },
                        })}
                        options={["Conventional Farming", "Natural / Zero-Budget Farming", "Residue-Free"]}
                      />
                    </div>
                  </div>
                )}

                {/* Agricultural Producer / FPO Sub-form */}
                {currentType === "Agricultural Producer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      label="FPO Legal Name"
                      value={formData.sellerData.fpoName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, fpoName: e.target.value },
                      })}
                      placeholder="e.g. Kongu Uzhavar Producer Co Ltd"
                      required
                    />
                    <FormSelect
                      label="Organization Structure"
                      value={formData.sellerData.fpoStructure || "Farmer Producer Company (FPC)"}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, fpoStructure: e.target.value },
                      })}
                      options={["Farmer Producer Company (FPC)", "Registered Cooperative Society", "Joint Liability Group (JLG)", "Self Help Group (SHG)"]}
                    />
                    <FormSelect
                      label="Member Farmers"
                      value={formData.sellerData.fpoMemberCount || "200 - 500 Farmers"}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, fpoMemberCount: e.target.value },
                      })}
                      options={["50 - 200 Farmers", "200 - 500 Farmers", "500 - 1,500 Farmers", "1,500+ Farmers"]}
                    />
                  </div>
                )}

                {/* Organic Producer Sub-form */}
                {currentType === "Organic Producer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      label="Organic Farm / Brand Name"
                      value={formData.sellerData.organicFarmName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, organicFarmName: e.target.value },
                      })}
                      required
                    />
                    <FormSelect
                      label="Certification Status"
                      value={formData.sellerData.organicCertStatus || "Certified Organic (NPOP)"}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, organicCertStatus: e.target.value },
                      })}
                      options={["Certified Organic (NPOP)", "In-Conversion (C1 / C2)", "PGS-India Green / Organic", "Natural Farming (Uncertified)"]}
                    />
                    <FormInput
                      label="Certifying Body"
                      value={formData.sellerData.organicCertAgency || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, organicCertAgency: e.target.value },
                      })}
                      placeholder="e.g. Aditi Organic, OneCert"
                    />
                  </div>
                )}

                {/* Raw Material Provider Sub-form */}
                {currentType === "Raw-Material Provider" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Provider Name"
                      value={formData.sellerData.rawProviderName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, rawProviderName: e.target.value },
                      })}
                      required
                    />
                    <FormInput
                      label="Warehouse Stock Capacity"
                      value={formData.sellerData.rawStockCapacity || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, rawStockCapacity: e.target.value },
                      })}
                      placeholder="e.g. 100 Metric Tonnes"
                    />
                  </div>
                )}

                {/* Ingredient Producer Sub-form */}
                {currentType === "Ingredient Producer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Enterprise Name"
                      value={formData.sellerData.ingProducerName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, ingProducerName: e.target.value },
                      })}
                      required
                    />
                    <FormInput
                      label="FSSAI Food License (14 Digits)"
                      value={formData.sellerData.ingFssaiNumber || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, ingFssaiNumber: e.target.value },
                      })}
                      maxLength={14}
                      required
                    />
                  </div>
                )}

                {/* Manufacturer Sub-form */}
                {currentType === "Manufacturer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Company Name"
                      value={formData.sellerData.mfgSellerName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, mfgSellerName: e.target.value },
                      })}
                      required
                    />
                    <FormInput
                      label="Monthly Manufacturing Output"
                      value={formData.sellerData.mfgCapacity || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, mfgCapacity: e.target.value },
                      })}
                      placeholder="e.g. 200 Metric Tonnes"
                    />
                  </div>
                )}

                {/* Value-Added Producer Sub-form */}
                {currentType === "Value-Added Manufacturer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Brand Name"
                      value={formData.sellerData.vaBrandName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, vaBrandName: e.target.value },
                      })}
                      required
                    />
                    <FormInput
                      label="FSSAI License (14 Digits)"
                      value={formData.sellerData.vaFssaiNumber || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        sellerData: { ...formData.sellerData, vaFssaiNumber: e.target.value },
                      })}
                      maxLength={14}
                      required
                    />
                  </div>
                )}

                {/* Other Sub-form */}
                {currentType === "Other" && (
                  <FormInput
                    label="Agricultural Activity Description"
                    value={formData.sellerData.otherActivity || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      sellerData: { ...formData.sellerData, otherActivity: e.target.value },
                    })}
                  />
                )}
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

