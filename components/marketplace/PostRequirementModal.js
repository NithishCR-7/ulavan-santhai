"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";
import { createEnquiry } from "@/services/enquiryApi";
import { BRD_CATEGORIES, QUALITY_GRADES } from "@/data/marketplaceCatalog";
import { CloseIcon, CheckCircleIcon } from "./Icons";

export default function PostRequirementModal({ isOpen, onClose }) {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [formData, setFormData] = useState({
    commodity: "",
    category: "Agricultural Products",
    requestedQuantity: "500",
    unit: "kg",
    grade: "Grade A (Premium)",
    packaging: "50kg Gunny Sacks",
    deliveryLocation: "Pollachi, 642001",
    neededByDate: "",
    targetPrice: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Prefill location and user defaults from session
  useEffect(() => {
    if (sessionUser?.location?.city) {
      setFormData((prev) => ({
        ...prev,
        deliveryLocation: `${sessionUser.location.city}, ${sessionUser.location.pinCode || "642001"}`,
      }));
    }
  }, [sessionUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.commodity.trim()) {
      setErrorMessage("Please enter the commodity or produce you require.");
      return;
    }
    const cleanQty = Number(String(formData.requestedQuantity).replace(/[^\d.]/g, ""));
    if (!cleanQty || cleanQty <= 0) {
      setErrorMessage("Please enter a valid requirement quantity greater than 0.");
      return;
    }
    if (!formData.deliveryLocation.trim()) {
      setErrorMessage("Please specify your delivery destination.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createEnquiry({
        commodity: formData.commodity.trim(),
        productCategory: formData.category,
        requestedQuantity: String(cleanQty),
        unitRequested: formData.unit,
        unit: formData.unit,
        grade: formData.grade,
        packaging: formData.packaging,
        deliveryLocation: formData.deliveryLocation.trim(),
        neededByDate: formData.neededByDate,
        targetPrice: formData.targetPrice,
        notes: formData.notes,
        message: `Buying Requirement for ${formData.commodity}: ${cleanQty} ${formData.unit}. Delivery to: ${formData.deliveryLocation}. Grade: ${formData.grade}. Packaging: ${formData.packaging}. ${formData.notes ? `Notes: ${formData.notes}` : ""}`,
        buyerId: sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER",
        buyerName: sessionUser?.businessName || sessionUser?.name || "Verified Buyer",
        buyerType: sessionUser?.buyerType || "Business Buyer",
        buyerDistrict: sessionUser?.location?.district || "Tamil Nadu",
        buyerPhone: sessionUser?.mobile ? `+91 ${sessionUser.mobile}` : "+91 98765 •••••",
        buyerEmail: sessionUser?.email || "buyer@example.com",
      });

      if (res.success && res.data) {
        setConfirmation({
          referenceId: res.data.id,
          commodity: formData.commodity,
          quantity: `${cleanQty} ${formData.unit}`,
          destination: formData.deliveryLocation,
          submittedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        });
        window.dispatchEvent(new Event("ulavan_enquiry_submitted"));
      } else {
        setErrorMessage(res.error || "Failed to post requirement. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error while submitting requirement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmation(null);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
              <span>B2B Buying Requirement</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Post a Buying Requirement
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify the crop, lot size, and specifications needed for your business.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {confirmation ? (
            /* Confirmation Screen */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#174B35] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircleIcon className="w-8 h-8 text-[#174B35]" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900">
                  Requirement Recorded Successfully
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Your buying requirement has been saved and registered under your enquiry desk.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2.5 text-xs max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Reference Number</span>
                  <span className="font-mono font-bold text-[#174B35]">{confirmation.referenceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Commodity</span>
                  <span className="font-bold text-gray-800">{confirmation.commodity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Required Volume</span>
                  <span className="font-bold text-gray-800">{confirmation.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Delivery Destination</span>
                  <span className="font-bold text-gray-800">{confirmation.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Submitted On</span>
                  <span className="text-gray-700">{confirmation.submittedAt}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 max-w-md mx-auto text-left">
                <strong>Platform Notice:</strong> Verified suppliers who view this requirement in their marketplace bulletin can respond with a quotation directly to your enquiries desk.
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    router.push("/buyer/enquiries");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  View in My Enquiries &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Requirement Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Commodity & BRD Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Commodity / Crop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="commodity"
                    required
                    value={formData.commodity}
                    onChange={handleChange}
                    placeholder="e.g. Deluxe Ponni Paddy / Small Red Shallots"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    BRD Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {BRD_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Required Quantity / Volume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="requestedQuantity"
                    required
                    min="1"
                    value={formData.requestedQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 1000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Unit of Measure <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="tonne">Metric Tonne (MT)</option>
                    <option value="pack">Commercial Pack / Box</option>
                    <option value="litre">Litre (for oils/honey)</option>
                  </select>
                </div>
              </div>

              {/* Grade & Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Quality / Grade Preference
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    {QUALITY_GRADES.filter((g) => g !== "All Grades").map((gr) => (
                      <option key={gr} value={gr}>
                        {gr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Packaging Specification
                  </label>
                  <select
                    name="packaging"
                    value={formData.packaging}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    <option value="50kg Gunny Sacks">50kg Traditional Jute Gunny Sacks</option>
                    <option value="25kg HDPE Woven Bags">25kg HDPE Woven Bags</option>
                    <option value="Corrugated Master Cartons">Corrugated Master Cartons</option>
                    <option value="15L Food Grade Tin Containers">15L Food Grade Tin Containers</option>
                    <option value="Loose Bulk Tipper / Mandi">Loose Bulk Tipper / Mandi</option>
                  </select>
                </div>
              </div>

              {/* Delivery Destination & Needed Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivery Location (Destination) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    required
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    placeholder="City, Pincode"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Needed-by Date
                  </label>
                  <input
                    type="date"
                    name="neededByDate"
                    value={formData.neededByDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Price (₹ per unit, optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-gray-500">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="targetPrice"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    placeholder="e.g. 140 / kg"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>
              </div>

              {/* Notes / Special requirements */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Technical Specifications / Processing Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Mention moisture limits, grain length, organic certification requirements, payment terms, or delivery frequency..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Requirement"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

