"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createEnquiry } from "@/services/enquiryApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function SendEnquiryModal({
  product,
  seller,
  isOpen,
  onClose,
  onEnquirySuccess,
}) {
  const sessionUser = useSessionUser();

  const [requestedQuantity, setRequestedQuantity] = useState(
    product?.minOrderQuantity || 100
  );
  const [subject, setSubject] = useState(
    `Purchase Enquiry for ${product?.title || "Harvest Produce"}`
  );
  const [message, setMessage] = useState(
    `Vanakkam. We are interested in procuring ${product?.title || "this harvest"} for our business. Please confirm your available stock, best wholesale rate, and earliest dispatch schedule.`
  );
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [needLabReport, setNeedLabReport] = useState(false);
  const [needPackaging, setNeedPackaging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please write an enquiry message for the seller.");
      return;
    }

    if (Number(requestedQuantity) <= 0) {
      setError("Please specify a valid quantity greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Assemble additional requirements string
      const reqList = [];
      if (needLabReport) reqList.push("Lab Analysis / Quality Certificate");
      if (needPackaging) reqList.push("Custom Wholesale Packaging / Crates");
      if (additionalRequirements.trim()) reqList.push(additionalRequirements.trim());

      const payload = {
        productId: product.id,
        productTitle: product.title,
        productCategory: product.category,
        productThumbnail: product.thumbnail || "/images/about-farmer-harvest.jpg",
        pricePerUnit: product.pricePerUnit,
        unit: product.unit || "kg",

        sellerId: seller?.sellerId || product.sellerId || "APP_US_982412",
        sellerName: seller?.businessName || seller?.contactPerson || product.sellerName || "Verified Producer",
        sellerDistrict: seller?.district || product.originDistrict || "Tamil Nadu",

        buyerId: sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER",
        buyerName: sessionUser?.name || "Registered Commercial Buyer",
        buyerType: sessionUser?.buyerType || sessionUser?.role || "Business Buyer",
        buyerDistrict: sessionUser?.location?.district || sessionUser?.district || "Tamil Nadu",
        buyerPhone: sessionUser?.mobile ? `+91 ${sessionUser.mobile}` : "+91 98765 •••••",
        buyerEmail: sessionUser?.email || "buyer@example.com",

        subject: subject.trim(),
        message: message.trim(),
        requestedQuantity: String(requestedQuantity),
        unitRequested: product.unit || "kg",
        additionalRequirements: reqList.join(" • "),
      };

      const res = await createEnquiry(payload);

      if (res.success && res.data) {
        setSubmittedEnquiry(res.data);
        if (onEnquirySuccess) onEnquirySuccess(res.data);
      } else {
        setError(res.error || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Error creating enquiry:", err);
      setError("Unable to send enquiry. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedEnquiry(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {submittedEnquiry ? (
          /* Submission Success State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#174B35] flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#729B59] bg-[#E8F0E3] px-3 py-1 rounded-full">
                Enquiry Dispatched
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">
                Enquiry Sent Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Your direct enquiry for <strong>{product.title}</strong> has been forwarded to{" "}
                <strong>{seller?.businessName || product.sellerName}</strong>.
              </p>
            </div>

            {/* Confirmation Box */}
            <div className="p-4 rounded-2xl bg-[#F5F5EB] border border-gray-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Enquiry Ref ID:</span>
                <span className="font-mono font-bold text-gray-800">{submittedEnquiry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Requested Quantity:</span>
                <span className="font-bold text-gray-900">
                  {submittedEnquiry.requestedQuantity} {submittedEnquiry.unitRequested}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Waiting for Seller Response
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/buyer/enquiries"
                className="flex-1 py-3 px-4 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs text-center shadow-xs transition-colors"
              >
                Track in My Enquiries &rarr;
              </Link>
              <button
                type="button"
                onClick={resetAndClose}
                className="py-3 px-5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Enquiry Form */
          <div>
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center text-xl shrink-0">
                  💬
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    Send Purchase Enquiry
                  </h3>
                  <p className="text-xs text-gray-500">
                    Connect directly with the producer without middleman commissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Product Summary Header Card */}
            <div className="my-4 p-3.5 rounded-2xl bg-[#F5F5EB] border border-gray-200/80 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-gray-200 bg-white">
                <Image
                  src={product?.thumbnail || "/images/about-farmer-harvest.jpg"}
                  alt={product?.title || "Product"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {product?.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="font-bold text-[#174B35]">
                    ₹{product?.pricePerUnit} / {product?.unit}
                  </span>
                  <span>&bull;</span>
                  <span>Seller: <strong>{seller?.businessName || product?.sellerName}</strong></span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Buyer Auto-Populated Profile Info */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="block font-bold">
                    Sending as: {sessionUser?.name || "Registered Commercial Buyer"}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    {sessionUser?.mobile ? `+91 ${sessionUser.mobile}` : "Verified Buyer Profile"} &bull;{" "}
                    {sessionUser?.location?.district || "Tamil Nadu"}
                  </span>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800">
                  Pre-filled
                </span>
              </div>

              {/* Requested Quantity */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Requested Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900 pr-16"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
                    {product?.unit || "kg"}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Minimum Order Quantity (MOQ): {product?.minOrderQuantity || 1} {product?.unit || "kg"}
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enquiry Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message / Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your requirement, delivery schedule, preferred packaging, or payment terms..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900"
                  required
                />
              </div>

              {/* Additional Requirements Toggles */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700 block">
                  Special Procurement Options (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needLabReport}
                      onChange={(e) => setNeedLabReport(e.target.checked)}
                      className="rounded text-[#174B35] focus:ring-[#174B35]"
                    />
                    <span className="text-gray-700">Request Lab Quality Report</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needPackaging}
                      onChange={(e) => setNeedPackaging(e.target.checked)}
                      className="rounded text-[#174B35] focus:ring-[#174B35]"
                    />
                    <span className="text-gray-700">Custom Packaging Needed</span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Other specific requirement (e.g. transport arrangement, target date)"
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#174B35]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Enquiry to Seller</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
