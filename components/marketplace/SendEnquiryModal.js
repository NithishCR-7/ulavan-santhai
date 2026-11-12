"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";
import { createEnquiry } from "@/services/enquiryApi";
import { unlockSellerContact } from "@/services/sellerAccessApi";
import { CloseIcon, CheckCircleIcon } from "./Icons";

export default function SendEnquiryModal({ isOpen, onClose, product }) {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [message, setMessage] = useState(
    "I would like to know about bulk pricing and delivery details."
  );
  const [requestedQuantity, setRequestedQuantity] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!isOpen || !product) return;
    setMessage("I would like to know about bulk pricing and delivery details.");
    setRequestedQuantity(
      product.moqDisplay?.replace("MOQ: ", "") ||
      `${product.minOrderQuantity || 100} ${product.unit || "kg"}`
    );
    setConfirmation(null);
    setErrorMessage("");
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    setIsSubmitting(true);

    try {
      const sellerId = product.sellerId || "APP_US_AGRIFRESH";
      const sellerName = product.sellerName || "AgriFresh Exports";

      // 1. Enforce unique seller quota deduction rule
      const unlockRes = await unlockSellerContact(product.id, sellerId, product.title);
      if (!unlockRes.success && unlockRes.reason === "QUOTA_EXHAUSTED") {
        setErrorMessage(
          "You have reached your 10 free unique seller limit. Please top up your views to enquire with new sellers."
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Submit enquiry
      const res = await createEnquiry({
        productId: product.id,
        productTitle: product.title,
        productCategory: product.category,
        productThumbnail: product.thumbnail || product.image,
        pricePerUnit: product.pricePerUnit || product.price,
        unit: product.unit,
        sellerId: sellerId,
        sellerName: sellerName,
        sellerDistrict: product.originDistrict || product.district,
        buyerId: sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER",
        buyerName: sessionUser?.name || "Sherlin A",
        buyerEmail: sessionUser?.email || "sherlin@gmail.com",
        requestedQuantity: requestedQuantity,
        message: message,
        notes: message,
      });

      if (res.success && res.data) {
        setConfirmation({
          referenceId: res.data.id,
          productTitle: product.title,
          supplierName: sellerName,
          quantity: requestedQuantity,
          submittedAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        });

        window.dispatchEvent(new Event("ulavan_enquiry_submitted"));
        window.dispatchEvent(new Event("ulavan_access_changed"));
      } else {
        setErrorMessage(res.error || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Enquiry error:", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header matching Screenshot 4: "Enquire About This Product" */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
            Enquire About This Product
          </h3>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4">
          {confirmation ? (
            /* Confirmation Screen */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900">
                  Enquiry Submitted!
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Your message has been sent to <strong>{confirmation.supplierName}</strong>. They will contact you shortly.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ref ID:</span>
                  <span className="font-mono font-bold text-[#174B35]">{confirmation.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Commodity:</span>
                  <span className="font-bold text-gray-800">{confirmation.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-bold text-gray-800">{confirmation.quantity}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    router.push("/buyer/enquiries");
                  }}
                  className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  View in My Enquiries &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Form matching Screenshot 4 */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Product Mini Tile matching Screenshot 4 */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/90 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white relative shrink-0 border border-gray-200">
                  <Image
                    src={product.thumbnail || product.image || "/images/about-farmer-harvest.jpg"}
                    alt={product.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-gray-900 truncate">
                    {product.title}
                  </h4>
                  <div className="text-xs text-gray-600 font-bold mt-0.5">
                    {product.pricePerUnit ? `₹${product.pricePerUnit} /${product.unit}` : product.moqDisplay || "Wholesale Lot"}
                  </div>
                </div>
              </div>

              {/* Message field with Character Counter (60/500 matching Screenshot 4) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Your Message (Optional)
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I would like to know about bulk pricing and delivery details."
                  className="w-full p-3 rounded-2xl border border-gray-300 focus:border-[#174B35] outline-none text-xs text-gray-800 resize-none transition-colors"
                />
              </div>

              {/* Footer Buttons matching Screenshot 4: [Cancel] & [Send Enquiry] */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Enquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}