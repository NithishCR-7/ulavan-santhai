"use client";

import { useState } from "react";
import {
  BRD_CATEGORIES,
  QUALITY_GRADES,
  ORGANIC_STATUSES,
  AVAILABILITY_STATUSES,
  MOQ_RANGES,
} from "@/data/marketplaceCatalog";

export default function FilterPanel({
  filters = {},
  onFilterChange,
  onClearFilters,
  isMobileModal = false,
  isOpen = false,
  onClose,
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showMoreOrigins, setShowMoreOrigins] = useState(false);

  // Accordion open states
  const [openSections, setOpenSections] = useState({
    productType: false,
    grade: false,
    moq: false,
    availability: false,
    certification: false,
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

  // Pre-configured origins with counts matching Screenshot 6
  const primaryOrigins = [
    { name: "Tamil Nadu", count: 120 },
    { name: "Karnataka", count: 78 },
    { name: "Maharashtra", count: 62 },
  ];

  const extendedOrigins = [
    { name: "Andhra Pradesh", count: 45 },
    { name: "Punjab", count: 32 },
    { name: "Kerala", count: 28 },
  ];

  const activeCategory = filters.category || filters.categories?.[0] || "";

  const panelContent = (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* CARD 1: Categories Box (Screenshot 6 Reference)          */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4">
        <button
          type="button"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between text-sm font-extrabold text-gray-900 cursor-pointer pb-2"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Categories</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${categoriesOpen ? "rotate-0" : "-rotate-90"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {categoriesOpen && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {BRD_CATEGORIES.map((cat) => {
              const isSelected =
                activeCategory.toLowerCase() === cat.name.toLowerCase() ||
                activeCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:text-[#174B35] transition-colors py-0.5 group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          onFilterChange("categories", []);
                          onFilterChange("category", "");
                        } else {
                          onFilterChange("categories", [cat.name]);
                          onFilterChange("category", cat.name);
                        }
                      }}
                      className="w-4 h-4 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                    />
                    <span className={`font-medium ${isSelected ? "font-bold text-[#174B35]" : "text-gray-800"}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-600">
                    ({cat.count || 50})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CARD 2: Filters Box (Screenshot 6 Reference)             */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 space-y-4">
        {/* Header with Clear All */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-extrabold text-gray-900">Filters</span>
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-bold text-[#174B35] hover:text-[#103A29] hover:underline cursor-pointer transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* 1. Origin Filter matching Screenshot 6 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-900 block">Origin</span>
          <div className="space-y-1.5 pl-0.5">
            {primaryOrigins.map((orig) => {
              const checked = (filters.districts || []).includes(orig.name);
              return (
                <label
                  key={orig.name}
                  className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:text-gray-900 py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxArray("districts", orig.name)}
                      className="w-4 h-4 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                    />
                    <span className="text-gray-800">{orig.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">({orig.count})</span>
                </label>
              );
            })}

            {/* Extended origins when clicking "+ Show more" */}
            {showMoreOrigins &&
              extendedOrigins.map((orig) => {
                const checked = (filters.districts || []).includes(orig.name);
                return (
                  <label
                    key={orig.name}
                    className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:text-gray-900 py-0.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxArray("districts", orig.name)}
                        className="w-4 h-4 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                      />
                      <span className="text-gray-800">{orig.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">({orig.count})</span>
                  </label>
                );
              })}

            <button
              type="button"
              onClick={() => setShowMoreOrigins(!showMoreOrigins)}
              className="text-xs font-bold text-[#174B35] hover:underline cursor-pointer block pt-1"
            >
              {showMoreOrigins ? "− Show less" : "+ Show more"}
            </button>
          </div>
        </div>

        {/* 2. Product Type Accordion */}
        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => toggleSection("productType")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
          >
            <span>Product Type</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openSections.productType ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.productType && (
            <div className="space-y-1.5 pt-2 pl-0.5">
              {["Grains & Cereals", "Vegetables", "Spices", "Pulses", "Processed Foods", "Fruits"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={(filters.subcategories || []).includes(type)}
                    onChange={() => handleCheckboxArray("subcategories", type)}
                    className="w-3.5 h-3.5 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 3. Grade Accordion */}
        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => toggleSection("grade")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
          >
            <span>Grade</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openSections.grade ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.grade && (
            <div className="space-y-1.5 pt-2 pl-0.5">
              {["Grade: A", "Grade: Premium", "Grade: B", "Commercial"].map((g) => (
                <label key={g} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={(filters.grades || []).includes(g)}
                    onChange={() => handleCheckboxArray("grades", g)}
                    className="w-3.5 h-3.5 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 4. MOQ Accordion */}
        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => toggleSection("moq")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
          >
            <span>MOQ</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openSections.moq ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.moq && (
            <div className="space-y-1.5 pt-2 pl-0.5">
              {[
                { id: "all", label: "Any MOQ" },
                { id: "< 100 kg", label: "< 100 kg" },
                { id: "100 - 500 kg", label: "100 - 500 kg" },
                { id: "500 kg - 2 MT", label: "500 kg - 2 MT" },
                { id: "> 2 MT (Bulk lots)", label: "> 2 MT (Bulk lots)" },
              ].map((range) => (
                <label key={range.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="filter_moq"
                    checked={(filters.moqRange || "all") === range.id}
                    onChange={() => onFilterChange("moqRange", range.id)}
                    className="w-3.5 h-3.5 text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 5. Availability Accordion */}
        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
          >
            <span>Availability</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openSections.availability ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.availability && (
            <div className="space-y-1.5 pt-2 pl-0.5">
              {[
                { id: "IN_STOCK", label: "In Stock" },
                { id: "HARVEST_READY", label: "Harvest Ready" },
                { id: "PRE_ORDER", label: "Pre-Order" },
              ].map((av) => (
                <label key={av.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={(filters.availabilities || []).includes(av.id)}
                    onChange={() => handleCheckboxArray("availabilities", av.id)}
                    className="w-3.5 h-3.5 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                  />
                  <span>{av.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 6. Certification Accordion */}
        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => toggleSection("certification")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-[#174B35] cursor-pointer"
          >
            <span>Certification</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openSections.certification ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.certification && (
            <div className="space-y-1.5 pt-2 pl-0.5">
              {["Certified Organic (NPOP / Jaivik Bharat)", "FSSAI Registered", "Conventional Direct Farm"].map((cert) => (
                <label key={cert} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={(filters.organicStatuses || []).includes(cert)}
                    onChange={() => handleCheckboxArray("organicStatuses", cert)}
                    className="w-3.5 h-3.5 rounded text-[#174B35] focus:ring-[#174B35] border-gray-300 accent-[#174B35]"
                  />
                  <span>{cert}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If used inside a mobile bottom sheet / drawer
  if (isMobileModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h3 className="font-extrabold text-base text-gray-900">Filter Commodities</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">{panelContent}</div>
          <div className="pt-3 border-t border-gray-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClearFilters}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#174B35] text-white font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return panelContent;
}