"use client";

import Image from "next/image";
import Link from "next/link";
import { getLocalSellerProfile } from "@/services/sellerApi";

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
  mode = "preview", // "preview" | "view"
  onConfirmSubmit,
  isSubmitting = false,
  onTriggerStatusToggle,
}) {
  if (!isOpen || !product) return null;

  const seller = getLocalSellerProfile();

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : product.thumbnail || "/images/about-farmer-harvest.jpg";

  const isViewMode = mode === "view";
  const isInactive = product.status === "INACTIVE";
  const isPending = product.status === "PENDING" || product.status === "WAITING_APPROVAL";
  const isRejected = product.status === "REJECTED";
  const isDraft = product.status === "DRAFT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>{isViewMode ? "Product Details" : "Marketplace Buyer Preview"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#174B35] tracking-tight">
              {isViewMode ? "Listing Overview" : "Produce Preview"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Status Alert Banner in View Mode */}
          {isViewMode && (
            <div>
              {isPending && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <span className="text-base shrink-0">⏳</span>
                  <div>
                    <strong className="block font-bold">Waiting for Quality Approval</strong>
                    <span>
                      This produce is currently under review by UlavanSanthai admin. Verification is typically completed within 2 to 4 business hours.
                    </span>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <strong className="block font-bold">Review Feedback / Revision Needed</strong>
                    <span>
                      {product.rejectionReason || "Produce photos or variety specifications need verification. Please edit and resubmit."}
                    </span>
                  </div>
                </div>
              )}

              {isInactive && (
                <div className="p-3.5 rounded-2xl bg-gray-100 border border-gray-300 text-gray-800 text-xs flex items-start gap-2.5">
                  <span className="text-base shrink-0">🔒</span>
                  <div>
                    <strong className="block font-bold">Produce Currently Deactivated</strong>
                    <span>
                      This listing is hidden from commercial buyers on the marketplace. You can reactivate it at any time.
                    </span>
                  </div>
                </div>
              )}

              {isDraft && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 text-xs flex items-start gap-2.5">
                  <span className="text-base shrink-0">📝</span>
                  <div>
                    <strong className="block font-bold">Saved as Draft</strong>
                    <span>
                      This produce is saved as a draft. Click &ldquo;Edit Produce&rdquo; to complete required details and submit for review.
                    </span>
                  </div>
                </div>
              )}

              {product.status === "ACTIVE" && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold">Live on Agricultural Marketplace</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Visible to Buyers</span>
                </div>
              )}
            </div>
          )}

          {/* Main Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Image Preview */}
            <div className="sm:col-span-5">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                <Image
                  src={displayImage}
                  alt={product.title || "Product Preview"}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {product.category || "Produce"}
                </div>
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {product.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 border border-gray-200"
                    >
                      <Image src={img.url} alt="thumbnail" fill sizes="48px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {product.grade || "Grade A"}
                  </span>
                  {product.organicStatus && product.organicStatus !== "Conventional Farming" && (
                    <span className="text-xs font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                      🌿 {product.organicStatus}
                    </span>
                  )}
                </div>

                <h4 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                  {product.title || "Untitled Agricultural Produce"}
                </h4>

                {product.variety && (
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Variety: <span className="text-gray-800 font-bold">{product.variety}</span>
                  </p>
                )}

                {/* Price Display */}
                <div className="mt-3 p-3 rounded-xl bg-[#F5F5EB] border border-gray-200/70 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#174B35]">
                    ₹{Number(product.pricePerUnit || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    / {product.unit || "kg"}
                  </span>
                </div>
              </div>

              {/* Quantities & Location */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Available Stock</span>
                  <span className="font-bold text-gray-900">
                    {Number(product.availableStock || 0).toLocaleString("en-IN")} {product.unit || "kg"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Min. Order Quantity (MOQ)</span>
                  <span className="font-bold text-gray-900">
                    {Number(product.minOrderQuantity || 1).toLocaleString("en-IN")} {product.moqUnit || product.unit || "kg"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Origin Location</span>
                  <span className="font-bold text-gray-900">
                    {product.originDistrict || "Coimbatore"}, {product.originState || "Tamil Nadu"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Availability Status</span>
                  <span className="font-bold text-emerald-700">
                    {product.availabilityStatus === "IN_STOCK" ? "Ready in Stock" : product.availabilityStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="bg-[#F5F5EB]/60 p-4 rounded-2xl border border-gray-200/80">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Produce Description
              </h5>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Contextual Specifications Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Specifications &amp; Producer Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Producer:</span>
                <span className="font-bold text-gray-900">{product.sellerName || seller?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Classification:</span>
                <span className="font-bold text-emerald-800">{product.sellerType || seller?.sellerType}</span>
              </div>
              {product.farmingMethod && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Farming Method:</span>
                  <span className="font-bold text-gray-900">{product.farmingMethod}</span>
                </div>
              )}
              {product.harvestSeason && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Harvest Season:</span>
                  <span className="font-bold text-gray-900">{product.harvestSeason}</span>
                </div>
              )}
              {product.aggregatedSupply && (
                <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2">
                  <span className="text-gray-500">Aggregated Supply:</span>
                  <span className="font-bold text-gray-900">{product.aggregatedSupply}</span>
                </div>
              )}
              {product.rawCommodityGrade && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Commodity Grade:</span>
                  <span className="font-bold text-gray-900">{product.rawCommodityGrade}</span>
                </div>
              )}
              {product.processingMethod && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Processing Method:</span>
                  <span className="font-bold text-gray-900">{product.processingMethod}</span>
                </div>
              )}
              {product.shelfLife && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Shelf Life:</span>
                  <span className="font-bold text-gray-900">{product.shelfLife}</span>
                </div>
              )}
              {product.packagingType && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Packaging Type:</span>
                  <span className="font-bold text-gray-900">{product.packagingType}</span>
                </div>
              )}
              {product.certificationDetails && (
                <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2">
                  <span className="text-gray-500">Certification Scope:</span>
                  <span className="font-bold text-emerald-800">{product.certificationDetails}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {isViewMode ? "Close" : "← Back to Edit Form"}
          </button>

          {isViewMode ? (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Deactivate / Reactivate button */}
              {onTriggerStatusToggle && (
                <button
                  type="button"
                  onClick={() => onTriggerStatusToggle(product)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isInactive
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
                  }`}
                >
                  {isInactive ? "Reactivate Product" : "Deactivate"}
                </button>
              )}

              {/* Edit Produce Button */}
              <Link
                href={`/seller/products/add?edit=${product.id}`}
                className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>Edit Produce</span>
                <span>&rarr;</span>
              </Link>
            </div>
          ) : (
            onConfirmSubmit && (
              <button
                type="button"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Submit for Review</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
