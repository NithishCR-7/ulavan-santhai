"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({
  product,
  onEnquire,
  onViewSupplier,
  isSaved = false,
  onToggleSave,
}) {
  const [imgError, setImgError] = useState(false);

  // Compute display values matching Screenshot 6
  const categoryDisplay =
    product.displayCategory ||
    product.subcategory ||
    product.category ||
    "Agricultural Produce";

  const originDisplay =
    product.originDistrict ||
    (product.originState ? `${product.originState}, India` : "Tamil Nadu, India");

  const gradeDisplay =
    product.grade?.startsWith("Grade") ? product.grade : `Grade: ${product.grade || "A"}`;

  const moqDisplay =
    product.moqDisplay ||
    `MOQ: ${product.minOrderQuantity || 100} ${product.moqUnit || product.unit || "kg"}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
      {/* Top Image Container with Wishlist Heart */}
      <div className="relative w-full aspect-4/3 bg-[#F5F5EB] overflow-hidden">
        <Link href={`/marketplace/products/${product.id}`} className="block w-full h-full">
          {!imgError && product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.imageAlt || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-linear-to-br from-emerald-50 to-[#E8F0E3] text-[#174B35] text-center">
              <span className="text-3xl mb-1">🌾</span>
              <span className="text-xs font-bold line-clamp-2">{product.title}</span>
            </div>
          )}
        </Link>

        {/* Wishlist Heart Icon (Top Right, matching Screenshot 6) */}
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
              : "bg-white/90 backdrop-blur-xs text-gray-500 hover:text-red-500 hover:bg-white"
          }`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
        >
          <svg
            className={`w-4 h-4 ${isSaved ? "fill-current" : "stroke-current fill-none"}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Card Body matching Screenshot 6 exactly */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Title */}
          <Link
            href={`/marketplace/products/${product.id}`}
            className="group-hover:text-[#174B35] transition-colors block"
          >
            <h3 className="text-sm sm:text-[15px] font-extrabold text-gray-900 line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* 1. Category with leaf icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-[#174B35] text-xs">🍃</span>
            <span className="truncate">{categoryDisplay}</span>
          </div>

          {/* 2. Origin with map pin icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-gray-500 text-xs">📍</span>
            <span className="truncate">{originDisplay}</span>
          </div>

          {/* 3. Grade with star icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-amber-500 text-xs">★</span>
            <span>{gradeDisplay}</span>
          </div>

          {/* 4. MOQ with cart/box icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-gray-500 text-xs">🛒</span>
            <span className="font-medium text-gray-700">{moqDisplay}</span>
          </div>

          {/* 5. Verified Seller Badge */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60">
              <span className="text-emerald-700 font-bold">✓</span>
              <span>Verified Seller</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: [View details] & [Enquire] (Screenshot 6 Reference) */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          {/* [View details] button */}
          <Link
            href={`/marketplace/products/${product.id}`}
            className="flex-1 py-2 px-2.5 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold text-center transition-colors block cursor-pointer"
          >
            View details
          </Link>

          {/* [Enquire] solid forest green button */}
          <button
            type="button"
            onClick={() => onEnquire && onEnquire(product)}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold text-center shadow-xs transition-colors cursor-pointer"
          >
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
}

