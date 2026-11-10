"use client";

import { useState } from "react";

export default function SupplierPanel({
  product,
  seller,
  quotaRemaining = 10,
  isUnlocked = false,
  onEnquire,
  onViewSupplier,
  isSaved = false,
  onToggleSave,
  onUnlockContact,
  isUnlocking = false,
}) {
  const minQty = Number(product.minOrderQuantity) || 100;
  const [quantity, setQuantity] = useState(minQty);

  const handleQtyChange = (val) => {
    const num = Math.max(minQty, Number(val) || minQty);
    setQuantity(num);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm sticky top-28 space-y-5">
      {/* 1. Supplier Header */}
      <div className="space-y-2 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Verified Supplier
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span>✓ Verified Producer</span>
          </span>
        </div>

        <h4 className="text-lg font-black text-gray-900 leading-tight">
          {product.sellerName}
        </h4>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>📍</span>
          <span>
            Dispatches from <strong className="text-gray-900">{product.originLocation || `${product.originDistrict}, TN`}</strong>
          </span>
        </div>
      </div>

      {/* 2. Order Quantity Selector */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Enquiry Quantity</span>
          <span className="text-gray-400 font-normal">
            Min. Order: {minQty} {product.unit}
          </span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#174B35]">
          <button
            type="button"
            onClick={() => handleQtyChange(quantity - Math.max(10, Math.floor(minQty / 5)))}
            disabled={quantity <= minQty}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-base disabled:opacity-30 cursor-pointer"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            min={minQty}
            onChange={(e) => handleQtyChange(e.target.value)}
            className="flex-1 py-2 text-center text-sm font-extrabold text-gray-900 border-none outline-none focus:ring-0"
          />
          <span className="px-3 text-xs font-semibold text-gray-500 bg-gray-50 border-l border-gray-200">
            {product.unit}
          </span>
          <button
            type="button"
            onClick={() => handleQtyChange(quantity + Math.max(10, Math.floor(minQty / 5)))}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-base cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Primary CTA: Send Enquiry */}
        <button
          type="button"
          onClick={() => onEnquire && onEnquire(quantity)}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Send Enquiry</span>
        </button>

        {/* Outline Secondary Actions: View Supplier & Save */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewSupplier}
            className="py-2.5 px-3 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>View Supplier</span>
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isSaved
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-300 hover:border-gray-400 text-gray-700 bg-white"
            }`}
          >
            <svg className={`w-4 h-4 ${isSaved ? "fill-red-600 text-red-600" : "fill-none stroke-current"}`} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{isSaved ? "Saved" : "Save Product"}</span>
          </button>
        </div>
      </div>

      {/* 4. Seller Contact Unlock Card & Entitlement Note */}
      <div className="p-3.5 rounded-2xl bg-[#F5F5EB] border border-gray-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-gray-800">
          <span>Supplier Contact Details</span>
          {isUnlocked ? (
            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
              <span>✓ Unlocked</span>
            </span>
          ) : (
            <span className="text-gray-500 font-medium">Locked</span>
          )}
        </div>

        {isUnlocked && seller ? (
          <div className="space-y-1.5 pt-1 text-gray-700 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-gray-200">
            <div>📞 {seller.phone || "+91 98765 43210"}</div>
            <div>✉️ {seller.email || "seller@ulavansanthai.in"}</div>
            <div className="text-[10px] text-gray-500 font-sans mt-1">
              🏢 {seller.address || "Anaimalai Road, Pollachi"}
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Contact details unlock with <strong>1 of your {quotaRemaining} remaining seller views</strong>.
            </p>
            <button
              type="button"
              onClick={onUnlockContact}
              disabled={isUnlocking}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-gray-50 text-[#174B35] font-bold text-xs border border-[#174B35]/40 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>{isUnlocking ? "Unlocking..." : "Unlock Direct Contact (1 View)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Trust Reminder */}
      <div className="text-[11px] text-gray-500 text-center space-y-1">
        <div>🔒 0% Middleman Brokerage Guaranteed</div>
        <div>Direct Trade between Producer &amp; Commercial Buyer</div>
      </div>
    </div>
  );
}

