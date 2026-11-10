"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";
import { createEnquiry } from "@/services/enquiryApi";
import { QUALITY_GRADES } from "@/data/marketplaceCatalog";

export default function SendEnquiryModal({ isOpen, onClose, product }) {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [formData, setFormData] = useState({
    requestedQuantity: "100",
    unitRequested: "kg",
    grade: "Grade A (Export Quality)",
    packaging: "Standard 50kg Sacks",
    deliveryLocation: "Pollachi, 642001",
    neededByDate: "",
    targetPrice: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Sync with product and user session
  useEffect(() => {
    if (!isOpen || !product) return;

    const userCity = sessionUser?.location?.city
      ? `${sessionUser.location.city}, ${sessionUser.location.pinCode || "642001"}`
      : "Pollachi, 642001";

    // Check if there is a saved draft for this product
    try {
      const rawDraft = localStorage.getItem(`ulavan_draft_enq_${product.id}`);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        setFormData(parsed);
        setDraftSaved(true);
        return;
      }
    } catch (e) {}

    setFormData({
      requestedQuantity: String(product.moq || 50),
      unitRequested: product.unit || "kg",
      grade: product.grade || "Grade A (Premium)",
      packaging: product.packaging || "Standard 50kg Sacks",
      deliveryLocation: userCity,
      neededByDate: "",
      targetPrice: product.price ? String(product.price) : "",
      notes: "",
    });
    setConfirmation(null);
    setErrorMessage("");
    setDraftSaved(false);
  }, [isOpen, product, sessionUser]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(`ulavan_draft_enq_${product.id}`, JSON.stringify(formData));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanQty = Number(String(formData.requestedQuantity).replace(/[^\d.]/g, ""));
    if (!cleanQty || cleanQty <= 0) {
      setErrorMessage("Please enter a valid quantity greater than zero.");
      return;
    }
    if (product.moq && cleanQty < product.moq) {
      setErrorMessage(
        `Quantity must meet or exceed the seller's Minimum Order Quantity of ${product.moq} ${product.unit}.`
      );
      return;
    }
    if (!formData.deliveryLocation.trim()) {
      setErrorMessage("Please provide a delivery location.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createEnquiry({
        productId: product.id,
        productTitle: product.title,
        productCategory: product.category,
        productThumbnail: product.image,
        pricePerUnit: product.price,
        unit: product.unit,
        sellerId: product.sellerId || "APP_US_982412",
        sellerName: product.sellerName || "Verified Producer",
        sellerDistrict: product.district || "Tamil Nadu",
        buyerId: sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER",
        buyerName: sessionUser?.businessName || sessionUser?.name || "Verified Buyer",
        buyerType: sessionUser?.buyerType || "Business Buyer",
        buyerDistrict: sessionUser?.location?.district || "Tamil Nadu",
        buyerPhone: sessionUser?.mobile ? `+91 ${sessionUser.mobile}` : "+91 98765 •••••",
        buyerEmail: sessionUser?.email || "buyer@example.com",
        requestedQuantity: String(cleanQty),
        unitRequested: formData.unitRequested,
        targetPrice: formData.targetPrice,
        grade: formData.grade,
        packaging: formData.packaging,
        deliveryLocation: formData.deliveryLocation.trim(),
        neededByDate: formData.neededByDate,
        notes: formData.notes,
        subject: `Purchase Enquiry for ${product.title}`,
        message: `Commercial purchase enquiry for ${product.title}: ${cleanQty} ${formData.unitRequested} at destination ${formData.deliveryLocation}. Target Price: ₹${formData.targetPrice || product.price}/${formData.unitRequested}. Grade: ${formData.grade}. Packaging: ${formData.packaging}. ${formData.notes ? `Special Notes: ${formData.notes}` : ""}`,
      });

      if (res.success && res.data) {
        // Clear draft on successful send
        try {
          localStorage.removeItem(`ulavan_draft_enq_${product.id}`);
        } catch (e) {}

        setConfirmation({
          referenceId: res.data.id,
          productTitle: product.title,
          supplierName: product.sellerName,
          quantity: `${cleanQty} ${formData.unitRequested}`,
          deliveryLocation: formData.deliveryLocation,
          submittedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        });

        window.dispatchEvent(new Event("ulavan_enquiry_submitted"));
      } else {
        setErrorMessage(res.error || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error while submitting enquiry.");
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
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Direct Commercial Enquiry</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Send Enquiry to Supplier
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect directly with {product.sellerName} for bulk terms &amp; quotation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {confirmation ? (
            /* Confirmation Screen */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#174B35] flex items-center justify-center text-2xl mx-auto shadow-sm">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900">
                  Enquiry Transmitted Successfully
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Your purchase quotation request has been delivered to {confirmation.supplierName}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2.5 text-xs max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Enquiry Reference</span>
                  <span className="font-mono font-bold text-[#174B35]">{confirmation.referenceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Commodity</span>
                  <span className="font-bold text-gray-800">{confirmation.productTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Supplier</span>
                  <span className="font-bold text-gray-800">{confirmation.supplierName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Requested Volume</span>
                  <span className="font-bold text-gray-800">{confirmation.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Delivery To</span>
                  <span className="font-bold text-gray-800">{confirmation.deliveryLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transmission Date</span>
                  <span className="text-gray-700">{confirmation.submittedAt}</span>
                </div>
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
            /* Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {draftSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-semibold text-center">
                  ✓ Draft saved to local storage
                </div>
              )}

              {/* Product Info Strip */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white relative shrink-0 border border-gray-200">
                  <Image
                    src={product.image || "/images/about-farmer-harvest.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{product.title}</h4>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {product.sellerName} • {product.district}
                    {product.price && ` • ₹${product.price}/${product.unit}`}
                    {product.moq && ` • MOQ: ${product.moq} ${product.unit}`}
                  </div>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Required Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="requestedQuantity"
                    required
                    min={product.moq || 1}
                    value={formData.requestedQuantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                  {product.moq && (
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Supplier MOQ: <strong>{product.moq} {product.unit}</strong>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Unit of Measure <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unitRequested"
                    value={formData.unitRequested}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="tonne">Metric Tonne (MT)</option>
                    <option value="pack">Commercial Pack / Box</option>
                    <option value="litre">Litre (L)</option>
                  </select>
                </div>
              </div>

              {/* Grade & Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Quality / Grade
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

              {/* Delivery Location & Needed-by Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivery Location <span className="text-red-500">*</span>
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
                    placeholder={`e.g. ${product.price || 150} / ${product.unit}`}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enquiry Message / Notes to Supplier
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="State your business requirements, dispatch cadence, payment terms, or request for samples / lab test reports..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                >
                  Save Draft
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Transmitting..." : "Send Enquiry"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

