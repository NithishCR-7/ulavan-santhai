"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import ProductMarketplaceCard from "@/components/marketplace/ProductMarketplaceCard";
import { getMarketplaceProducts } from "@/services/marketplaceApi";

const PRODUCT_CATEGORIES = [
  "All Categories",
  "Vegetables & Tubers",
  "Fruits",
  "Grains & Millets",
  "Spices & Condiments",
  "Pulses & Legumes",
  "Oils & Oilseeds",
  "Plantation & Commercial Crops",
  "Organic & Natural Produce",
  "Processed & Value Added",
];

const QUALITY_GRADES = [
  "All Grades",
  "Grade A (Export Quality)",
  "Grade A (Premium)",
  "Grade B (Standard Commercial)",
  "Grade C (Processing Grade)",
];

const ORGANIC_STATUSES = [
  "All Farming Types",
  "Certified Organic (NPOP / Jaivik Bharat)",
  "Natural / Chemical-Free Farming",
  "Conventional Farming",
];

const AVAILABILITY_OPTIONS = [
  "All Availabilities",
  "IN_STOCK",
  "HARVEST_READY",
  "PRE_ORDER",
  "SEASONAL",
];

const TAMIL_NADU_DISTRICTS = [
  "All Districts",
  "Coimbatore",
  "Erode",
  "Salem",
  "Nilgiris",
  "Thanjavur",
  "Dindigul",
  "Tiruvannamalai",
  "Madurai",
  "Tirupur",
  "Namakkal",
  "Theni",
];

export default function BuyerMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading agricultural marketplace...
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All Categories";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedOrganic, setSelectedOrganic] = useState("All Farming Types");
  const [selectedAvailability, setSelectedAvailability] = useState("All Availabilities");
  const [maxMoq, setMaxMoq] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST"); // "NEWEST" | "OLDEST" | "NAME_AZ"

  // Load published products on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && res.data) {
          setProducts(res.data);
        } else if (isMounted) {
          setLoadError("Could not load marketplace products. Please try again.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch marketplace products:", err);
          setLoadError("Network error. Unable to connect to marketplace service.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await getMarketplaceProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setLoadError("Could not load marketplace products. Please try again.");
      }
    } catch {
      setLoadError("Network error. Unable to connect to marketplace service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDistrict("All Districts");
    setSelectedGrade("All Grades");
    setSelectedOrganic("All Farming Types");
    setSelectedAvailability("All Availabilities");
    setMaxMoq("");
    setSortBy("NEWEST");
  };

  const isFilterActive =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedDistrict !== "All Districts" ||
    selectedGrade !== "All Grades" ||
    selectedOrganic !== "All Farming Types" ||
    selectedAvailability !== "All Availabilities" ||
    maxMoq !== "" ||
    sortBy !== "NEWEST";

  // Filter & Sort Logic: Strict published rules
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Enforce published status rule: ONLY ACTIVE / PUBLISHED products
        if (p.status !== "ACTIVE" && p.status !== "PUBLISHED") {
          return false;
        }

        // Search Query (title, variety, subcategory, specifications, district)
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchesTitle = p.title?.toLowerCase().includes(q);
          const matchesCategory = p.category?.toLowerCase().includes(q);
          const matchesVariety = p.variety?.toLowerCase().includes(q);
          const matchesSubcategory = p.subcategory?.toLowerCase().includes(q);
          const matchesSpecs = p.specifications?.toLowerCase().includes(q);
          const matchesDistrict = p.originDistrict?.toLowerCase().includes(q);

          if (!matchesTitle && !matchesCategory && !matchesVariety && !matchesSubcategory && !matchesSpecs && !matchesDistrict) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== "All Categories" && p.category !== selectedCategory) {
          return false;
        }

        // District / Location Filter
        if (selectedDistrict !== "All Districts" && p.originDistrict !== selectedDistrict) {
          return false;
        }

        // Grade Filter
        if (selectedGrade !== "All Grades" && p.grade !== selectedGrade) {
          return false;
        }

        // Organic Status Filter
        if (selectedOrganic !== "All Farming Types" && p.organicStatus !== selectedOrganic) {
          return false;
        }

        // Availability Filter
        if (selectedAvailability !== "All Availabilities" && p.availabilityStatus !== selectedAvailability) {
          return false;
        }

        // Max MOQ Filter
        if (maxMoq && Number(p.minOrderQuantity) > Number(maxMoq)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") return (b.id > a.id ? 1 : -1);
        if (sortBy === "OLDEST") return (a.id > b.id ? 1 : -1);
        if (sortBy === "NAME_AZ") return (a.title || "").localeCompare(b.title || "");
        return 0;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedDistrict,
    selectedGrade,
    selectedOrganic,
    selectedAvailability,
    maxMoq,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* 1. Header Navigation */}
      <MarketplaceHeader />

      {/* 2. Hero & Search Banner */}
      <section className="bg-gradient-to-b from-white via-white to-[#F5F5EB]/60 border-b border-gray-200/80 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2 border border-[#729B59]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#729B59]"></span>
              <span>Tamil Nadu Agricultural Exchange</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#174B35] tracking-tight leading-tight">
              Explore Products
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 leading-relaxed">
              Find agricultural products and connect with suppliers. Direct wholesale trading with 0% middleman brokerage.
            </p>
          </div>

          {/* Large Search Box */}
          <div className="mt-6 sm:mt-8 max-w-4xl relative">
            <div className="relative flex items-center">
              <span className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop name, turmeric, carrots, paddy, oil, district, variety..."
                className="w-full pl-12 sm:pl-13 pr-24 sm:pr-32 py-3.5 sm:py-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#174B35]/40 focus:border-[#174B35] focus:outline-none focus:ring-4 focus:ring-[#174B35]/10 text-sm sm:text-base text-gray-900 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-20 sm:right-28 text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
              <span className="absolute right-3 sm:right-4 px-3 py-1.5 rounded-xl bg-[#E8F0E3] text-[#174B35] text-xs font-bold">
                {filteredProducts.length} Lots
              </span>
            </div>
          </div>

          {/* 4. Horizontal Category Pill Navigation */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#174B35] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 & 7. Secondary Filter & Sorting Controls */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Filter Lots:
              </span>
              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#174B35] hover:underline cursor-pointer"
                >
                  Clear All Filters &times;
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="NAME_AZ">Product Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {/* 1. Origin District */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Origin District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-[#174B35]"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Quality Grade */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Quality Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-[#174B35]"
              >
                {QUALITY_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Organic Status */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Farming Type</label>
              <select
                value={selectedOrganic}
                onChange={(e) => setSelectedOrganic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-[#174B35]"
              >
                {ORGANIC_STATUSES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Availability Status */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-[#174B35]"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a === "IN_STOCK" ? "Ready in Stock" : a === "HARVEST_READY" ? "Harvest Ready" : a}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Max MOQ Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Max MOQ (Units)</label>
              <input
                type="number"
                min="1"
                value={maxMoq}
                onChange={(e) => setMaxMoq(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-[#174B35]"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {loadError && (
          <div className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3.5 py-1.5 rounded-lg bg-red-800 text-white font-bold text-xs hover:bg-red-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* 11. Loading State */}
        {isLoading ? (
          <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="animate-spin w-9 h-9 border-4 border-[#174B35] border-t-transparent rounded-full mx-auto" />
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Loading verified agricultural produce listings...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* 11. Empty Filter / Search Result State */
          <div className="mt-12 bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-200/90 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-3xl shadow-xs">
              🌾
            </div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900">
              No agricultural produce found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No published products matched your search "${searchQuery}". Try searching for another crop, variety, or district.`
                : "No approved and published products match the selected filters."}
            </p>
            {isFilterActive && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] shadow-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 3. Product Listings Grid */
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500">
                Showing <strong className="text-gray-900">{filteredProducts.length}</strong> verified produce lots
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                0% Brokerage &bull; Direct Producer Trade
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductMarketplaceCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

