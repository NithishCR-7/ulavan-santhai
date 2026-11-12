"use client";

import { LeafIcon } from "./Icons";

export default function StatusBadge({ type, label, size = "sm" }) {
  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-2 py-0.5"
      : size === "md"
      ? "text-xs px-3 py-1"
      : "text-[11px] px-2.5 py-0.5";

  switch (type) {
    case "SOLD_OUT":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>{label || "Sold Out"}</span>
        </span>
      );

    case "IN_STOCK":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>{label || "In Stock"}</span>
        </span>
      );

    case "HARVEST_READY":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{label || "Harvest Ready"}</span>
        </span>
      );

    case "PRE_ORDER":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>{label || "Pre-Order"}</span>
        </span>
      );

    case "SEASONAL":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>{label || "Seasonal Lot"}</span>
        </span>
      );

    case "VERIFIED_SUPPLIER":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40 ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 text-[#174B35]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{label || "Verified Producer"}</span>
        </span>
      );

    case "ORGANIC":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 ${sizeClasses}`}
        >
          <LeafIcon className="w-3 h-3 text-emerald-800" />
          <span>{label || "Certified Organic"}</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}
        >
          <span>{label}</span>
        </span>
      );
  }
}
