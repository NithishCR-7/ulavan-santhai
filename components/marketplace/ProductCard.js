"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

export default function ProductCard({
  product,
  onEnquire,
  onViewSupplier,
  isSaved = false,
  onToggleSave,
}) {
  const [imgError, setImgError] = useState(false);

  const isSoldOut = product.isSoldOut || product.availabilityStatus === "SOLD_OUT" || Number(product.availableStock) <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
      {/* Top Image Container (4:3 aspect ratio) */}
      <div className="relative w-full aspect-4/3 bg-[#F5F5EB] overflow-hidden">
        <Link href={`/marketplace/products/${product.id}`} className="block w-full h-full">
          {!imgError && product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.imageAlt || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            /* Neutral styled fallback tile (No empty grey boxes) */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-linear-to-br from-emerald-50 to-[#E8F0E3] text-[#174B35] text-center">
              <span className="text-3xl mb-1">🌾</span>
              <span className="text-xs font-bold line-clamp-2">{product.title}</span>
              <span className="text-[10px] text-gray-500 mt-1">Ulavan Santhai Direct</span>
            </div>
          )}
        </Link>

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isSoldOut ? (
            <StatusBadge type="SOLD_OUT" label="Sold Out" size="xs" />
          ) : (
            <StatusBadge type={product.availabilityStatus || "IN_STOCK"} size="xs" />
          )}

          {product.organicStatus?.includes("Organic") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-xs text-emerald-900 border border-emerald-300 shadow-2xs">
              <span>🌱</span>
              <span>Organic</span>
            </span>
          )}
        </div>

        {/* Save Bookmark Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleSave) onToggleSave(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer z-10 ${
            isSaved
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-white/90 backdrop-blur-xs text-gray-600 hover:text-red-600 hover:bg-white"
          }`}
          aria-label={isSaved ? "Remove from Saved" : "Save Product"}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Origin Pill (Bottom of Image) */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium">
            <span>📍</span>
            <span>{product.originDistrict || "Tamil Nadu"}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#729B59] mb-1 truncate">
            {product.category} {product.subcategory ? `• ${product.subcategory}` : ""}
          </div>

          {/* Product Title */}
          <Link href={`/marketplace/products/${product.id}`} className="group-hover:text-[#174B35] transition-colors block">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 line-clamp-1 leading-snug">
              {product.title}
            </h3>
            {/* Optional Tamil secondary line */}
            {product.tamilTitle && product.tamilTitle !== product.title && (
              <span className="text-xs text-gray-500 font-medium block line-clamp-1 mt-0.5">
                {product.tamilTitle}
              </span>
            )}
          </Link>

          {/* Key Specs Pill Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {product.grade || "Grade A"}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              MOQ: <strong className="text-gray-900">{product.minOrderQuantity} {product.moqUnit || product.unit}</strong>
            </span>
          </div>

          {/* Supplier Name */}
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate">{product.sellerName}</span>
          </div>
        </div>

        {/* Bottom Section: Price Box + Action Buttons */}
        <div className="pt-2 border-t border-gray-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-gray-500">Wholesale:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-gray-900">
                  ₹{product.pricePerUnit}
                </span>
                <span className="text-xs text-gray-500 font-medium">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              <span>Lot: </span>
              <strong className="text-gray-800">{product.availableStock} {product.unit}</strong>
            </div>
          </div>

          {/* Action Buttons: "Send Enquiry" is the strongest primary CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEnquire && onEnquire(product)}
              className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Send Enquiry</span>
            </button>

            {onViewSupplier && (
              <button
                type="button"
                onClick={() => onViewSupplier(product)}
                className="py-2 sm:py-2.5 px-2.5 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors cursor-pointer"
                title="View Verified Supplier"
              >
                Supplier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

