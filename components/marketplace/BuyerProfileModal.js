"use client";

import { useState, useEffect } from "react";
import { useSessionUser } from "@/services/sessionAuth";
import { BRD_CATEGORIES, BUYER_TYPES } from "@/data/marketplaceCatalog";

export default function BuyerProfileModal({ isOpen, onClose }) {
  const sessionUser = useSessionUser();

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    buyerType: "Individual",
    email: "",
    mobile: "",
    gstin: "",
    address: "",
    city: "Pollachi",
    district: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "642001",
    categoriesOfInterest: ["Agricultural Products", "Organic Products"],
  });

  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (sessionUser) {
      setFormData({
        name: sessionUser.name || "Verified Trader",
        businessName: sessionUser.businessName || sessionUser.buyerData?.businessName || "",
        buyerType: sessionUser.buyerType || sessionUser.buyerData?.businessDesignation || "Business",
        email: sessionUser.email || "trader@ulavansanthai.in",
        mobile: sessionUser.mobile || "9876543210",
        gstin: sessionUser.gstin || sessionUser.buyerData?.businessGstin || "",
        address: sessionUser.location?.address || sessionUser.buyerData?.address || "Main Mandi Road",
        city: sessionUser.location?.city || sessionUser.buyerData?.city || "Pollachi",
        district: sessionUser.location?.district || sessionUser.buyerData?.district || "Coimbatore",
        state: "Tamil Nadu",
        pinCode: sessionUser.location?.pinCode || sessionUser.buyerData?.pinCode || "642001",
        categoriesOfInterest: sessionUser.categoriesOfInterest || [
          "Agricultural Products",
          "Organic Products",
        ],
      });
      setIsSaved(false);
      setErrorMessage("");
    }
  }, [isOpen, sessionUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleCategory = (catName) => {
    setFormData((prev) => {
      const exists = prev.categoriesOfInterest.includes(catName);
      return {
        ...prev,
        categoriesOfInterest: exists
          ? prev.categoriesOfInterest.filter((c) => c !== catName)
          : [...prev.categoriesOfInterest, catName],
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!formData.city.trim() || !formData.pinCode.trim()) {
      setErrorMessage("City and Pincode are required for delivery quotation calculations.");
      return;
    }

    try {
      const updatedUser = {
        ...sessionUser,
        name: formData.name.trim(),
        businessName: formData.businessName.trim(),
        buyerType: formData.buyerType,
        gstin: formData.gstin.trim(),
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          district: formData.district,
          state: formData.state,
          pinCode: formData.pinCode.trim(),
        },
        categoriesOfInterest: formData.categoriesOfInterest,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Verified Account</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              My Buyer Business Profile
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your commercial trading identity and delivery destination.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          <form onSubmit={handleSave} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-bold text-center animate-in fade-in">
                ✓ Business profile updated successfully!
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Trading Role & Status Badge */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Account Status</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Paid Membership (₹365)
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Trading Role</span>
                <span className="font-bold text-[#174B35]">Buyer</span>
              </div>
            </div>

            {/* Name & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name / Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Salem Organic Traders"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>
            </div>

            {/* Email & Phone (Readonly auth) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.mobile ? `+91 ${formData.mobile}` : "+91 98765 43210"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Buyer Type & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Buyer Classification
                </label>
                <select
                  name="buyerType"
                  value={formData.buyerType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                >
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Food Processor">Food Processor</option>
                  <option value="Bakery or Food Business">Bakery or Food Business</option>
                  <option value="Reseller">Reseller</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  GSTIN (if applicable)
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Default Delivery City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  required
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>
            </div>

            {/* Categories of Interest */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Categories of Interest (Personalized Recommendations)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BRD_CATEGORIES.map((cat) => {
                  const isChecked = formData.categoriesOfInterest.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.name)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-[#174B35] text-white border-[#174B35]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="truncate">{cat.shortName || cat.name}</span>
                      <span className="text-[11px]">{isChecked ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

