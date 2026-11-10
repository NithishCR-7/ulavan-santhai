"use client";

export default function FilterChips({ filters, onRemoveFilter, onClearAll }) {
  const chips = [];

  if (filters.searchQuery) {
    chips.push({ key: "searchQuery", label: `Search: "${filters.searchQuery}"` });
  }

  if (filters.category && filters.category !== "All Categories") {
    chips.push({ key: "category", label: `Category: ${filters.category}` });
  }

  if (filters.subcategory) {
    chips.push({ key: "subcategory", label: `Subcategory: ${filters.subcategory}` });
  }

  if (Array.isArray(filters.districts)) {
    filters.districts.forEach((d) => {
      chips.push({ key: "district", value: d, label: `Origin: ${d}` });
    });
  }

  if (Array.isArray(filters.grades)) {
    filters.grades.forEach((g) => {
      chips.push({ key: "grade", value: g, label: `Grade: ${g}` });
    });
  }

  if (Array.isArray(filters.availabilities)) {
    filters.availabilities.forEach((a) => {
      const display = a === "IN_STOCK" ? "In Stock" : a === "SOLD_OUT" ? "Sold Out" : a.replace(/_/g, " ");
      chips.push({ key: "availability", value: a, label: `Status: ${display}` });
    });
  }

  if (Array.isArray(filters.organicStatuses)) {
    filters.organicStatuses.forEach((o) => {
      chips.push({ key: "organic", value: o, label: o });
    });
  }

  if (filters.moqRange && filters.moqRange !== "all") {
    chips.push({ key: "moqRange", label: `MOQ: ${filters.moqLabel || filters.moqRange}` });
  }

  if (filters.verifiedOnly) {
    chips.push({ key: "verifiedOnly", label: "Verified Suppliers Only" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-1 animate-in fade-in duration-150">
      <span className="text-xs font-semibold text-gray-500 mr-1">Applied Filters:</span>
      {chips.map((chip, idx) => (
        <span
          key={`${chip.key}-${chip.value || idx}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40 hover:bg-[#d8e6d1] transition-colors shadow-2xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#174B35]/20 text-[#174B35] font-bold cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            ×
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline ml-2 cursor-pointer transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

