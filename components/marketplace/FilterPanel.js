"use client";

import { useState } from "react";
import {
  BRD_CATEGORIES,
  TAMIL_NADU_DISTRICTS,
  QUALITY_GRADES,
  ORGANIC_STATUSES,
  AVAILABILITY_STATUSES,
  MOQ_RANGES,
} from "@/data/marketplaceCatalog";

export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  isMobileModal = false,
  isOpen = false,
  onClose,
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    district: true,
    grade: true,
    availability: true,
    organic: true,
    moq: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxArray = (field, value) => {
    const current = filters[field] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange(field, updated);
  };

  const content = (
    <div className="space-y-6 text-sm text-gray-800">
      {/* Header inside panel (desktop only or mobile header) */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-extrabold text-gray-900 text-base">Filters</span>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-bold text-gray-500 hover:text-red-700 hover:underline cursor-pointer transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* 1. Category & Subcategories */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Commodity Category</span>
          <span className="text-gray-400 font-normal">{openSections.category ? "−" : "+"}</span>
        </button>
        {openSections.category && (
          <div className="space-y-2 pt-1 pl-1">
            <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="category_filter"
                checked={!filters.category || filters.category === "All Categories"}
                onChange={() => onFilterChange("category", "All Categories")}
                className="text-[#174B35] focus:ring-[#174B35]"
              />
              <span className="font-semibold text-gray-900">All Categories</span>
            </label>
            {BRD_CATEGORIES.map((cat) => {
              const isChecked = filters.category === cat.name;
              return (
                <div key={cat.id} className="space-y-1">
                  <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="category_filter"
                      checked={isChecked}
                      onChange={() => onFilterChange("category", cat.name)}
                      className="text-[#174B35] focus:ring-[#174B35]"
                    />
                    <span className="font-bold">{cat.icon} {cat.name}</span>
                  </label>
                  {/* Subcategories if category selected */}
                  {isChecked && (
                    <div className="pl-6 space-y-1.5 pt-1 border-l-2 border-[#174B35]/20 ml-2">
                      {cat.subcategories.map((sub) => (
                        <label key={sub} className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer hover:text-[#174B35]">
                          <input
                            type="radio"
                            name="subcategory_filter"
                            checked={filters.subcategory === sub}
                            onChange={() => onFilterChange("subcategory", filters.subcategory === sub ? "" : sub)}
                            className="text-[#174B35] focus:ring-[#174B35]"
                          />
                          <span>{sub}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Origin District */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("district")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Origin District (Tamil Nadu)</span>
          <span className="text-gray-400 font-normal">{openSections.district ? "−" : "+"}</span>
        </button>
        {openSections.district && (
          <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
            {TAMIL_NADU_DISTRICTS.filter((d) => d !== "All Districts").map((district) => (
              <label key={district} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={(filters.districts || []).includes(district)}
                  onChange={() => handleCheckboxArray("districts", district)}
                  className="rounded border-gray-300 text-[#174B35] focus:ring-[#174B35]"
                />
                <span>{district}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Minimum Order Quantity (MOQ Range) */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("moq")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Minimum Order Quantity (MOQ)</span>
          <span className="text-gray-400 font-normal">{openSections.moq ? "−" : "+"}</span>
        </button>
        {openSections.moq && (
          <div className="space-y-1.5 pt-1">
            {MOQ_RANGES.map((range) => (
              <label key={range.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="moq_range"
                  checked={(filters.moqRange || "all") === range.id}
                  onChange={() => {
                    onFilterChange("moqRange", range.id);
                    onFilterChange("moqLabel", range.label);
                  }}
                  className="text-[#174B35] focus:ring-[#174B35]"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quality Grade */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("grade")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Quality Grade</span>
          <span className="text-gray-400 font-normal">{openSections.grade ? "−" : "+"}</span>
        </button>
        {openSections.grade && (
          <div className="space-y-1.5 pt-1">
            {QUALITY_GRADES.filter((g) => g !== "All Grades").map((grade) => (
              <label key={grade} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={(filters.grades || []).includes(grade)}
                  onChange={() => handleCheckboxArray("grades", grade)}
                  className="rounded border-gray-300 text-[#174B35] focus:ring-[#174B35]"
                />
                <span>{grade}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 5. Stock Availability */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Stock Availability</span>
          <span className="text-gray-400 font-normal">{openSections.availability ? "−" : "+"}</span>
        </button>
        {openSections.availability && (
          <div className="space-y-1.5 pt-1">
            {AVAILABILITY_STATUSES.filter((s) => s !== "All Availabilities").map((status) => {
              const label =
                status === "IN_STOCK"
                  ? "In Stock"
                  : status === "HARVEST_READY"
                  ? "Harvest Ready"
                  : status === "PRE_ORDER"
                  ? "Pre-Order"
                  : status === "SEASONAL"
                  ? "Seasonal Lot"
                  : "Sold Out";
              return (
                <label key={status} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={(filters.availabilities || []).includes(status)}
                    onChange={() => handleCheckboxArray("availabilities", status)}
                    className="rounded border-gray-300 text-[#174B35] focus:ring-[#174B35]"
                  />
                  <span className={status === "SOLD_OUT" ? "text-red-700 font-semibold" : ""}>{label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Certification & Organic Status */}
      <div className="space-y-2 pb-2">
        <button
          type="button"
          onClick={() => toggleSection("organic")}
          className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
        >
          <span>Farming &amp; Certification</span>
          <span className="text-gray-400 font-normal">{openSections.organic ? "−" : "+"}</span>
        </button>
        {openSections.organic && (
          <div className="space-y-2 pt-1">
            {ORGANIC_STATUSES.filter((o) => o !== "All Farming Types").map((status) => (
              <label key={status} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={(filters.organicStatuses || []).includes(status)}
                  onChange={() => handleCheckboxArray("organicStatuses", status)}
                  className="rounded border-gray-300 text-[#174B35] focus:ring-[#174B35]"
                />
                <span>{status}</span>
              </label>
            ))}

            <label className="flex items-center gap-2.5 text-xs font-bold text-[#174B35] cursor-pointer pt-2 border-t border-gray-100">
              <input
                type="checkbox"
                checked={!!filters.verifiedOnly}
                onChange={(e) => onFilterChange("verifiedOnly", e.target.checked)}
                className="rounded border-gray-300 text-[#174B35] focus:ring-[#174B35]"
              />
              <span>Verified Producers Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  // If mobile modal view:
  if (isMobileModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#F5F5EB]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[#174B35]">Filter Products</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 font-bold border border-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{content}</div>

        <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  // Desktop sidebar container
  return (
    <aside className="w-64 lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs h-fit sticky top-28 hidden md:block">
      {content}
    </aside>
  );
}

