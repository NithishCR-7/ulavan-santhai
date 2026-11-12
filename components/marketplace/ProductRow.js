"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import {
  SproutIcon,
  LeafIcon,
  CheckIcon,
  HeartIcon,
  MailIcon,
} from "./Icons";

export default function ProductRow({
  product,
  onEnquire,
  onViewSupplier,
  isSaved = false,
  onToggleSave,
}) {
  const [imgError, setImgError] = useState(false);

  const isSoldOut =
    product.isSoldOut ||
    product.availabilityStatus === "SOLD_OUT" ||
    Number(product.availableStock) <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center justify-between">
      {/* 1. Left: Product Square Image (1:1) */}
      <div className="relative w-full md:w-44 h-44 sm:h-48 md:h-36 shrink-0 rounded-xl overflow-hidden bg-[#F5F5EB] border border-gray-100">
        <Link href={`/marketplace/products/${product.id}`} className="block w-full h-full">
          {!imgError && product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.imageAlt || product.title}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-linear-to-br from-emerald-50 to-[#E8F0E3] text-[#174B35] text-center">
              <SproutIcon className="w-8 h-8 text-emerald-700 mb-1" />
              <span className="text-xs font-bold line-clamp-2">{product.title}</span>
            </div>
          )}
        </Link>

        {/* Badge Overlay */}
        <div className="absolute top-2 left-2 z-10">
          {isSoldOut ? (
            <StatusBadge type="SOLD_OUT" size="xs" />
          ) : (
            <StatusBadge type={product.availabilityStatus || "IN_STOCK"} size="xs" />
          )}
        </div>
      </div>

      {/* 2. Middle: Details */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#729B59]">
            {product.category} {product.subcategory ? `• ${product.subcategory}` : ""}
          </span>
          {product.organicStatus?.includes("Organic") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <LeafIcon className="w-3 h-3 text-emerald-700" />
              <span>Organic</span>
            </span>
          )}
        </div>

        <Link
          href={`/marketplace/products/${product.id}`}
          className="group-hover:text-[#174B35] transition-colors block"
        >
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug">
            {product.title}
          </h3>
          {product.tamilTitle && product.tamilTitle !== product.title && (
            <span className="text-xs text-gray-500 font-medium block mt-0.5">
              {product.tamilTitle}
            </span>
          )}
        </Link>

        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Specs Grid */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 pt-1">
          <span>
            Grade: <strong className="text-gray-900">{product.grade || "Grade A"}</strong>
          </span>
          <span>•</span>
          <span>
            Origin: <strong className="text-gray-900">{product.originDistrict}, TN</strong>
          </span>
          <span>•</span>
          <span>
            Packaging: <strong className="text-gray-900">{product.packaging || "Bulk Sacks"}</strong>
          </span>
        </div>

        {/* Supplier Info */}
        <div className="flex items-center gap-2 pt-1 text-xs text-gray-700">
          <span className="font-semibold">{product.sellerName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-[#E8F0E3] px-2 py-0.5 rounded-full">
            <CheckIcon className="w-3 h-3 text-emerald-700" />
            <span>Verified Producer</span>
          </span>
        </div>
      </div>

      {/* 3. Right: Price, MOQ & Action Buttons */}
      <div className="w-full md:w-56 shrink-0 md:border-l md:border-gray-200 md:pl-6 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-xs text-gray-500 block">Wholesale Rate:</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-gray-900">₹{product.pricePerUnit}</span>
            <span className="text-xs text-gray-500 font-semibold">/ {product.unit}</span>
          </div>

          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <div>
              MOQ:{" "}
              <strong className="text-gray-900">
                {product.minOrderQuantity} {product.moqUnit || product.unit}
              </strong>
            </div>
            <div>
              Available Stock:{" "}
              <strong className="text-gray-900">
                {product.availableStock} {product.unit}
              </strong>
            </div>
          </div>
        </div>

        {/* Action CTAs: Send Enquiry primary, Save & View Supplier outline */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => onEnquire && onEnquire(product)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MailIcon className="w-4 h-4 text-white" />
            <span>Send Enquiry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave && onToggleSave(product)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                isSaved
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-gray-300 hover:border-gray-400 text-gray-700 bg-white"
              }`}
            >
              <HeartIcon
                className={`w-3.5 h-3.5 ${isSaved ? "text-red-600 fill-red-600" : "text-gray-400"}`}
                filled={isSaved}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            {onViewSupplier && (
              <button
                type="button"
                onClick={() => onViewSupplier(product)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors cursor-pointer text-center"
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
