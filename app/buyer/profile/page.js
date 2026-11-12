"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { useSessionUser } from "@/services/sessionAuth";
import {
  UserIcon,
  HomeIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  LocationIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@/components/marketplace/Icons";

export default function BuyerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading buyer profile...
        </div>
      }
    >
      <BuyerProfileContent />
    </Suspense>
  );
}

function BuyerProfileContent() {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "Sherlin A",
    email: "sherlinzenith@gmail.com",
    mobile: "9876543210",
    buyerType: "Food Processor",
    businessName: "Sherlin Agro Processing Works",
    gstin: "33AABCS1429B1ZB",
    address: "SF No. 142, Trichy Main Road",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600001",
    interests: ["Pulses", "Grains", "Spices", "Cold-Pressed Oils"],
  });

  useEffect(() => {
    if (sessionUser) {
      setFormData((prev) => ({
        ...prev,
        name: sessionUser.name || prev.name,
        email: sessionUser.email || prev.email,
        mobile: sessionUser.mobile || prev.mobile,
        buyerType: sessionUser.buyerType || sessionUser.role || prev.buyerType,
        businessName: sessionUser.buyerData?.businessName || prev.businessName,
        gstin: sessionUser.buyerData?.gstin || prev.gstin,
        city: sessionUser.location?.city || prev.city,
        district: sessionUser.location?.district || prev.district,
        address: sessionUser.location?.fullAddress || prev.address,
        pinCode: sessionUser.location?.pinCode || prev.pinCode,
      }));
    }
  }, [sessionUser]);

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("ulavan_user");
        const current = stored ? JSON.parse(stored) : {};
        const updated = {
          ...current,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          buyerType: formData.buyerType,
          location: {
            ...current.location,
            city: formData.city,
            district: formData.district,
            fullAddress: formData.address,
            pinCode: formData.pinCode,
          },
          buyerData: {
            ...current.buyerData,
            businessName: formData.businessName,
            gstin: formData.gstin,
          },
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updated));
      } catch {}
    }
    setIsEditing(false);
    setSaveMessage("Profile details updated successfully.");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
      />

      {/* 2. Main Container with Sidebar + Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: Buyer Profile Form & Details */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Buyer Profile</span>
            </nav>

            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#174B35] text-white flex items-center justify-center text-2xl font-black shadow-inner ring-4 ring-emerald-50">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        {formData.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
                        <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formData.businessName} &bull; {formData.buyerType}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-semibold flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-700" />
                  <span>{saveMessage}</span>
                </div>
              )}
            </div>

            {/* Profile Form / Read-Only Display */}
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-6">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Commercial Account Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      required
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                      {formData.name}
                    </div>
                  )}
                </div>

                {/* 2. Buyer Classification */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Buyer Classification</label>
                  {isEditing ? (
                    <select
                      value={formData.buyerType}
                      onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800 bg-white"
                    >
                      <option value="Food Processor">Food Processor</option>
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Bakery or Food Business">Bakery or Food Business</option>
                      <option value="Reseller">Reseller</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                      {formData.buyerType}
                    </div>
                  )}
                </div>

                {/* 3. Business Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Business / Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                      {formData.businessName}
                    </div>
                  )}
                </div>

                {/* 4. GSTIN */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">GSTIN (If Applicable)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800 font-mono"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 font-mono">
                      {formData.gstin || "Not Applicable"}
                    </div>
                  )}
                </div>

                {/* 5. Mobile Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Registered Mobile</label>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 flex items-center justify-between">
                    <span>+91 {formData.mobile}</span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Verified</span>
                  </div>
                </div>

                {/* 6. Email */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Email Address</label>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                    {formData.email}
                  </div>
                </div>
              </div>

              {/* Delivery / Facility Location */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  Procurement Facility &amp; Registered Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="font-bold text-gray-700 block">Street / Warehouse Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                        {formData.address}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block">City / Town</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                        {formData.city}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                        {formData.district}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block">PIN Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.pinCode}
                        onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                        {formData.pinCode}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories of Interest */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  Product Categories of Interest
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#174B35] text-xs font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}

