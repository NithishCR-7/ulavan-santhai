"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import ProductCard from "@/components/marketplace/ProductCard";
import ProductRow from "@/components/marketplace/ProductRow";
import FilterPanel from "@/components/marketplace/FilterPanel";
import FilterChips from "@/components/marketplace/FilterChips";
import SellerAccessModal, { SellerAccessCard } from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import {
  BRD_CATEGORIES,
  SELLER_DIRECTORY,
  MOQ_RANGES,
} from "@/data/marketplaceCatalog";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function BuyerMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading Ulavan Santhai Agricultural Marketplace...
        </div>
      }
    >
      <MarketplaceApp />
    </Suspense>
  );
}

function MarketplaceApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useSessionUser();

  // URL search params
  const paramSearch = searchParams.get("search") || "";
  const paramCat = searchParams.get("category") || "";
  const paramSub = searchParams.get("sub") || "";
  const paramView = searchParams.get("view") || "";

  // Products from catalog + local sellers
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(paramSearch);
  const [selectedCategory, setSelectedCategory] = useState(paramCat);
  const [selectedSubcategory, setSelectedSubcategory] = useState(paramSub);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [selectedOrganic, setSelectedOrganic] = useState([]);
  const [selectedMoq, setSelectedMoq] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Sorting & Layout
  const [sortBy, setSortBy] = useState("RELEVANCE"); // "RELEVANCE" | "RECENT" | "PRICE_ASC" | "PRICE_DESC"
  const [layoutMode, setLayoutMode] = useState("grid"); // "grid" | "list"

  // Home Popular Tabs State
  const [popularTab, setPopularTab] = useState("All");

  // User Saved & Recent state
  const [savedIds, setSavedIds] = useState([]);
  const [recentIds, setRecentIds] = useState([]);

  // Modals state
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load products on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAllProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    if (paramSearch !== searchQuery) setSearchQuery(paramSearch);
    if (paramCat !== selectedCategory) setSelectedCategory(paramCat);
    if (paramSub !== selectedSubcategory) setSelectedSubcategory(paramSub);
  }, [paramSearch, paramCat, paramSub]);

  // Load saved & recent items from localStorage
  const loadStoredData = () => {
    try {
      const rawSaved = localStorage.getItem("ulavan_saved_products");
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.map((p) => (typeof p === "string" ? p : p.id)));
        }
      }
      const rawRecent = localStorage.getItem("ulavan_recent_views");
      if (rawRecent) {
        const parsed = JSON.parse(rawRecent);
        if (Array.isArray(parsed)) setRecentIds(parsed);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadStoredData();
    const handleSavedChanged = () => loadStoredData();
    window.addEventListener("ulavan_saved_changed", handleSavedChanged);
    return () => window.removeEventListener("ulavan_saved_changed", handleSavedChanged);
  }, []);

  // Toggle Save Bookmark
  const handleToggleSave = (prod) => {
    try {
      const rawSaved = localStorage.getItem("ulavan_saved_products");
      let list = rawSaved ? JSON.parse(rawSaved) : [];
      const prodId = prod.id;
      const alreadySaved = list.some((item) => (typeof item === "string" ? item === prodId : item.id === prodId));

      if (alreadySaved) {
        list = list.filter((item) => (typeof item === "string" ? item !== prodId : item.id !== prodId));
      } else {
        list.push(prod);
      }

      localStorage.setItem("ulavan_saved_products", JSON.stringify(list));
      setSavedIds(list.map((p) => (typeof p === "string" ? p : p.id)));
      window.dispatchEvent(new Event("ulavan_saved_changed"));
    } catch (e) {}
  };

  // Determine whether we are in "Home" view or "Explore / Listing" view
  const isExploreMode = useMemo(() => {
    if (paramView === "explore") return true;
    if (searchQuery.trim().length > 0) return true;
    if (selectedCategory && selectedCategory !== "All Categories") return true;
    if (selectedSubcategory) return true;
    if (selectedDistricts.length > 0) return true;
    if (selectedGrades.length > 0) return true;
    if (selectedAvailabilities.length > 0) return true;
    if (selectedOrganic.length > 0) return true;
    if (selectedMoq !== "all") return true;
    if (verifiedOnly) return true;
    return false;
  }, [
    paramView,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedDistricts,
    selectedGrades,
    selectedAvailabilities,
    selectedOrganic,
    selectedMoq,
    verifiedOnly,
  ]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Text Search (title, commodity, variety, sellerName, origin, description, specs)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const tamilMatch = (p.tamilTitle || "").includes(q);
        const sellerMatch = (p.sellerName || "").toLowerCase().includes(q);
        const districtMatch = (p.originDistrict || p.district || "").toLowerCase().includes(q);
        const varietyMatch = (p.variety || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const subMatch = (p.subcategory || "").toLowerCase().includes(q);
        return titleMatch || tamilMatch || sellerMatch || districtMatch || varietyMatch || catMatch || subMatch;
      });
    }

    // 2. Category
    if (selectedCategory && selectedCategory !== "All Categories") {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId === selectedCategory
      );
    }

    // 3. Subcategory
    if (selectedSubcategory) {
      result = result.filter(
        (p) => p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
      );
    }

    // 4. District
    if (selectedDistricts.length > 0) {
      result = result.filter((p) =>
        selectedDistricts.some(
          (d) =>
            p.originDistrict?.toLowerCase() === d.toLowerCase() ||
            p.district?.toLowerCase() === d.toLowerCase()
        )
      );
    }

    // 5. Grade
    if (selectedGrades.length > 0) {
      result = result.filter((p) =>
        selectedGrades.some((g) => p.grade?.toLowerCase().includes(g.toLowerCase()))
      );
    }

    // 6. Availability
    if (selectedAvailabilities.length > 0) {
      result = result.filter((p) =>
        selectedAvailabilities.some((a) => p.availabilityStatus === a)
      );
    }

    // 7. Organic
    if (selectedOrganic.length > 0) {
      result = result.filter((p) =>
        selectedOrganic.some((o) =>
          (p.organicStatus || "").toLowerCase().includes(o.toLowerCase())
        )
      );
    }

    // 8. MOQ Range
    if (selectedMoq && selectedMoq !== "all") {
      result = result.filter((p) => {
        const moq = Number(p.moq) || 0;
        if (selectedMoq === "< 100 kg") return moq < 100;
        if (selectedMoq === "100 - 500 kg") return moq >= 100 && moq <= 500;
        if (selectedMoq === "500 kg - 2 MT") return moq > 500 && moq <= 2000;
        if (selectedMoq === "> 2 MT (Bulk lots)") return moq > 2000;
        return true;
      });
    }

    // 9. Verified Suppliers Only
    if (verifiedOnly) {
      result = result.filter((p) => p.sellerVerified === true || p.verified === true);
    }

    // Sort
    if (sortBy === "RECENT") {
      result.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
    } else if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return result;
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedDistricts,
    selectedGrades,
    selectedAvailabilities,
    selectedOrganic,
    selectedMoq,
    verifiedOnly,
    sortBy,
  ]);

  // Matching suppliers for search query
  const matchingSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return SELLER_DIRECTORY.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.commodities?.some((c) => c.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Popular products tab filtered list
  const popularProducts = useMemo(() => {
    if (popularTab === "All") return allProducts.slice(0, 8);
    return allProducts
      .filter((p) => p.category?.toLowerCase() === popularTab.toLowerCase())
      .slice(0, 8);
  }, [allProducts, popularTab]);

  // Recommended products for this buyer
  const recommendedProducts = useMemo(() => {
    const interests = sessionUser?.categoriesOfInterest || [
      "Agricultural Products",
      "Organic Products",
    ];
    return allProducts
      .filter((p) =>
        interests.some((cat) => p.category?.toLowerCase().includes(cat.toLowerCase()))
      )
      .slice(0, 6);
  }, [allProducts, sessionUser]);

  // Recent products from localStorage
  const recentProducts = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [allProducts, recentIds]);

  // Active BRD Category object (if selected)
  const activeBrdCategory = useMemo(() => {
    return BRD_CATEGORIES.find(
      (c) => c.name.toLowerCase() === selectedCategory?.toLowerCase() || c.id === selectedCategory
    );
  }, [selectedCategory]);

  // Clear all filters action
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedDistricts([]);
    setSelectedGrades([]);
    setSelectedAvailabilities([]);
    setSelectedOrganic([]);
    setSelectedMoq("all");
    setVerifiedOnly(false);
    router.replace("/marketplace");
  };

  // Switch to Explore view with a given category
  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubcategory("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Header Search Handler
  const handleHeaderSearch = (query, cat) => {
    setSearchQuery(query);
    if (cat && cat !== "All Categories") {
      setSelectedCategory(cat);
    } else if (cat === "All Categories") {
      setSelectedCategory("");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header (Sticky 2-row header replacing left sidebar) */}
      <BuyerHeader
        initialSearch={searchQuery}
        initialCategory={selectedCategory || "All Categories"}
        onSearch={handleHeaderSearch}
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5">
        {/* ======================================================== */}
        {/* MODE A: HOME VIEW (Default when no filters / search)     */}
        {/* ======================================================== */}
        {!isExploreMode ? (
          <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-200">
            {/* 1. Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#174B35] via-[#1F4D36] to-[#0E2E20] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-900/20">
              {/* Subtle background decoration */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-overlay"
                style={{ backgroundImage: "url('/images/hero-aerial-fields.jpg')" }}
              />
              <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold tracking-wide">
                    <span>🌾 Direct Mandi Procurement</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>38 Districts of Tamil Nadu</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    Tamil Nadu&apos;s B2B Agricultural Mandi &amp; Producer Exchange
                  </h1>

                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                    Discover bulk milling lots, export-grade spices, certified organic grains, and farm raw materials direct from verified growers and FPOs with zero middleman brokerage.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All Categories");
                        router.push("/marketplace?view=explore");
                      }}
                      className="px-6 py-3 rounded-2xl bg-white text-[#174B35] font-extrabold text-xs sm:text-sm shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Explore Products</span>
                      <span>&rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPostRequirementOpen(true)}
                      className="px-5 py-3 rounded-2xl border-2 border-white/60 hover:border-white text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Post a Requirement</span>
                      <span>📋</span>
                    </button>
                  </div>
                </div>

                {/* Right Hero Card: Seller Access Quota Widget */}
                <div className="lg:col-span-5">
                  <SellerAccessCard onOpenDetails={() => setIsSellerAccessOpen(true)} />
                </div>
              </div>
            </div>

            {/* 2. Trust Strip (Real facts, no fake stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center text-lg shrink-0">
                  🚜
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Direct from Farm</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Verified FPOs &amp; growers in TN</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center text-lg shrink-0">
                  🌱
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Organic Where Certified</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">NPOP &amp; Jaivik Bharat documented</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center text-lg shrink-0">
                  📦
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">B2B Minimum Order Qty</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Bulk commercial packaging</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center text-lg shrink-0">
                  🤝
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Enquiry-Based Terms</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">0% middleman brokerage</p>
                </div>
              </div>
            </div>

            {/* 3. Shop by Category (The 4 BRD Categories) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Shop by Category
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Explore the 4 verified agricultural classification tiers from the BRD
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/marketplace?view=explore")}
                  className="text-xs font-bold text-[#174B35] hover:text-[#103A29] hover:underline cursor-pointer"
                >
                  View All Products &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {BRD_CATEGORIES.map((cat) => {
                  const catCount = allProducts.filter(
                    (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.name)}
                      className="group p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#174B35]/40 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F5EB] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {cat.icon}
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#174B35] transition-colors leading-snug">
                          {cat.name}
                        </h3>
                        <div className="text-[11px] font-semibold text-emerald-800">
                          {cat.tamilName}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full">
                          {catCount} active lots
                        </span>
                        <span className="font-bold text-gray-400 group-hover:text-[#174B35] group-hover:translate-x-1 transition-all">
                          Browse &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Continue Where You Left Off (if user has viewed products) */}
            {recentProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                      Continue Where You Left Off
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Recently inspected agricultural lots
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("ulavan_recent_views");
                      setRecentIds([]);
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recentProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isSaved={savedIds.includes(prod.id)}
                      onToggleSave={handleToggleSave}
                      onEnquire={(p) => setSelectedProductForEnquiry(p)}
                      onViewSupplier={(p) => {
                        const sup = SELLER_DIRECTORY.find((s) => s.id === p.sellerId || s.name === p.sellerName);
                        setSelectedSupplierForModal(
                          sup || {
                            id: p.sellerId,
                            name: p.sellerName,
                            sellerType: "Verified Producer",
                            district: p.originDistrict || p.district,
                            verified: true,
                          }
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Popular Products with Category Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Popular Commodities &amp; Lots
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    High-demand harvests direct from verified Tamil Nadu growing clusters
                  </p>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {["All", "Agricultural Products", "Organic Products", "Agricultural Raw Materials"].map(
                    (tab) => {
                      const isActive = popularTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setPopularTab(tab)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? "bg-[#174B35] text-white shadow-xs"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {tab === "Agricultural Products"
                            ? "Agri Produce"
                            : tab === "Agricultural Raw Materials"
                            ? "Raw Materials"
                            : tab}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Grid of Popular Products */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isSaved={savedIds.includes(prod.id)}
                    onToggleSave={handleToggleSave}
                    onEnquire={(p) => setSelectedProductForEnquiry(p)}
                    onViewSupplier={(p) => {
                      const sup = SELLER_DIRECTORY.find((s) => s.id === p.sellerId || s.name === p.sellerName);
                      setSelectedSupplierForModal(
                        sup || {
                          id: p.sellerId,
                          name: p.sellerName,
                          sellerType: "Verified Producer",
                          district: p.originDistrict || p.district,
                          verified: true,
                        }
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 6. Recommended for your business */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  Recommended for {sessionUser?.businessName || "Your Procurement Desk"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Curated based on your verified business profile &amp; category preferences
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {recommendedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isSaved={savedIds.includes(prod.id)}
                    onToggleSave={handleToggleSave}
                    onEnquire={(p) => setSelectedProductForEnquiry(p)}
                    onViewSupplier={(p) => {
                      const sup = SELLER_DIRECTORY.find((s) => s.id === p.sellerId || s.name === p.sellerName);
                      setSelectedSupplierForModal(
                        sup || {
                          id: p.sellerId,
                          name: p.sellerName,
                          sellerType: "Verified Producer",
                          district: p.originDistrict || p.district,
                          verified: true,
                        }
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 7. Verified Suppliers Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Verified Tamil Nadu Producers &amp; FPOs
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Connect directly with registered grower societies and certified processing mills
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SELLER_DIRECTORY.map((sup) => (
                  <div
                    key={sup.id}
                    className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#E8F0E3] text-[#174B35] font-black flex items-center justify-center text-lg shrink-0">
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-1">
                              {sup.name}
                            </h3>
                            <span className="text-[11px] text-gray-500 block">
                              {sup.district}, Tamil Nadu • Est. {sup.establishedYear}
                            </span>
                          </div>
                        </div>
                        {sup.verified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {sup.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sup.commodities?.slice(0, 3).map((comm, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium"
                          >
                            {comm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-semibold">
                        {sup.farmAcreage || "Direct Mandi"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSupplierForModal(sup)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#174B35] text-[#174B35] hover:bg-[#E8F0E3] text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Supplier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Post a Requirement Strip */}
            <div className="rounded-3xl bg-linear-to-r from-emerald-50 via-[#E8F0E3] to-teal-50 border border-emerald-200/90 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#174B35] tracking-wider uppercase bg-white/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Custom Lot Procurement
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                  Looking for a custom lot size, spice grade, or bulk contract?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
                  Post your buying requirement once. Verified suppliers across Tamil Nadu can review your parameters and respond directly with their mandi quotation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPostRequirementOpen(true)}
                className="px-6 py-3 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                Post Requirement &rarr;
              </button>
            </div>

            {/* 9. Marketplace Footer */}
            <footer className="pt-10 border-t border-gray-200 text-xs text-gray-500 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <span className="font-black text-base text-[#174B35]">Ulavan Santhai</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tamil Nadu&apos;s B2B agricultural exchange connecting buyers with farmers, FPOs, and processing mills with 0% middleman brokerage.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2.5">
                    BRD Categories
                  </h4>
                  <ul className="space-y-1.5">
                    {BRD_CATEGORIES.map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(cat.name)}
                          className="hover:text-[#174B35] cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2.5">
                    Trading Desk &amp; Policies
                  </h4>
                  <ul className="space-y-1.5">
                    <li>
                      <button
                        type="button"
                        onClick={() => setIsSellerAccessOpen(true)}
                        className="hover:text-[#174B35] cursor-pointer"
                      >
                        My Seller Access Quota
                      </button>
                    </li>
                    <li>
                      <Link href="/buyer/enquiries" className="hover:text-[#174B35]">
                        My Enquiries Desk
                      </Link>
                    </li>
                    <li>
                      <Link href="/marketplace/saved" className="hover:text-[#174B35]">
                        Saved Produce Watchlist
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setIsHelpOpen(true)}
                        className="hover:text-[#174B35] cursor-pointer"
                      >
                        Help &amp; FAQ
                      </button>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2.5">
                    Platform Guarantees
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enquiry-based B2B model with verified FPO seller credentials. No consumer checkout, no hidden brokerage fees.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                      Tamil Nadu Agricultural Exchange
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                <p>&copy; 2026 Ulavan Santhai. Farm to Market. All rights reserved.</p>
                <div className="flex items-center gap-4 text-gray-500">
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms of Trade</span>
                  <span>•</span>
                  <span>Fair Trade Mandi Guidelines</span>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          /* ======================================================== */
          /* MODE B: EXPLORE / CATEGORY / SEARCH LISTING VIEW        */
          /* ======================================================== */
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Category / Search Title Strip */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <button
                      type="button"
                      onClick={() => handleClearAllFilters()}
                      className="hover:text-[#174B35] font-semibold cursor-pointer"
                    >
                      Marketplace Home
                    </button>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">
                      {selectedCategory || "Explore Products"}
                    </span>
                    {selectedSubcategory && (
                      <>
                        <span>/</span>
                        <span className="text-[#174B35] font-bold">{selectedSubcategory}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {searchQuery
                      ? `Search: "${searchQuery}"`
                      : selectedCategory || "Explore Agricultural Produce"}
                  </h1>

                  {activeBrdCategory && (
                    <div className="mt-1 space-y-1">
                      <span className="text-xs font-semibold text-emerald-800 block">
                        {activeBrdCategory.tamilName}
                      </span>
                      <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                        {activeBrdCategory.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Subcategory Chips if BRD Category is active */}
                {activeBrdCategory && (
                  <div className="flex flex-wrap gap-1.5 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory("")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        !selectedSubcategory
                          ? "bg-[#174B35] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All {activeBrdCategory.shortName || "Subcategories"}
                    </button>
                    {activeBrdCategory.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          selectedSubcategory === sub
                            ? "bg-[#174B35] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls Bar: Result Count, Sort, Grid/List toggle, Mobile Filter trigger */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-gray-900">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
                  </span>

                  {/* Mobile filter button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="md:hidden px-3 py-1.5 rounded-xl border border-gray-300 font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer bg-white"
                  >
                    <span>⚙️ Filters</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35] cursor-pointer"
                    >
                      <option value="RELEVANCE">Relevance</option>
                      <option value="RECENT">Recently Added</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Grid / List Toggle */}
                  <div className="hidden sm:flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setLayoutMode("grid")}
                      className={`p-1.5 transition-colors cursor-pointer ${
                        layoutMode === "grid" ? "bg-[#174B35] text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Grid View"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode("list")}
                      className={`p-1.5 transition-colors cursor-pointer ${
                        layoutMode === "list" ? "bg-[#174B35] text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                      title="List View"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Applied Filter Chips */}
              <FilterChips
                filters={{
                  searchQuery,
                  category: selectedCategory,
                  subcategory: selectedSubcategory,
                  districts: selectedDistricts,
                  grades: selectedGrades,
                  availabilities: selectedAvailabilities,
                  organicStatuses: selectedOrganic,
                  moqRange: selectedMoq,
                  verifiedOnly,
                }}
                onRemoveFilter={(key, val) => {
                  if (key === "searchQuery") setSearchQuery("");
                  if (key === "category") setSelectedCategory("");
                  if (key === "subcategory") setSelectedSubcategory("");
                  if (key === "district") setSelectedDistricts((prev) => prev.filter((d) => d !== val));
                  if (key === "grade") setSelectedGrades((prev) => prev.filter((g) => g !== val));
                  if (key === "availability") setSelectedAvailabilities((prev) => prev.filter((a) => a !== val));
                  if (key === "organic") setSelectedOrganic((prev) => prev.filter((o) => o !== val));
                  if (key === "moqRange") setSelectedMoq("all");
                  if (key === "verifiedOnly") setVerifiedOnly(false);
                }}
                onClearAll={handleClearAllFilters}
              />
            </div>

            {/* Two-Column Listing Layout: Left Filter Panel (Desktop) + Right Results */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Desktop Filter Panel */}
              <aside className="hidden md:block md:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs sticky top-28">
                <FilterPanel
                  filters={{
                    categories: selectedCategory ? [selectedCategory] : [],
                    subcategories: selectedSubcategory ? [selectedSubcategory] : [],
                    districts: selectedDistricts,
                    grades: selectedGrades,
                    availabilities: selectedAvailabilities,
                    organicStatuses: selectedOrganic,
                    moqRange: selectedMoq,
                  }}
                  onFilterChange={(field, val) => {
                    if (field === "categories") setSelectedCategory(val[0] || "");
                    if (field === "subcategories") setSelectedSubcategory(val[0] || "");
                    if (field === "districts") setSelectedDistricts(val);
                    if (field === "grades") setSelectedGrades(val);
                    if (field === "availabilities") setSelectedAvailabilities(val);
                    if (field === "organicStatuses") setSelectedOrganic(val);
                    if (field === "moqRange") setSelectedMoq(val);
                  }}
                  onClearFilters={handleClearAllFilters}
                />
              </aside>

              {/* Results Column */}
              <div className="md:col-span-9 space-y-4">
                {/* Matching Suppliers Row if search is active */}
                {matchingSuppliers.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <h4 className="text-xs font-bold text-[#174B35] uppercase tracking-wider">
                      Matching Verified Suppliers ({matchingSuppliers.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingSuppliers.map((sup) => (
                        <div
                          key={sup.id}
                          className="p-3 bg-white rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-900 block">{sup.name}</span>
                            <span className="text-[11px] text-gray-500">
                              {sup.district} • {sup.sellerType}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSupplierForModal(sup)}
                            className="px-2.5 py-1 rounded-lg bg-[#174B35] text-white text-[11px] font-bold cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-3xl flex items-center justify-center mx-auto text-[#174B35]">
                      🌾
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        No agricultural lots match your filter criteria
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                        Try clearing some filter tags or searching with a broader commodity term like &quot;paddy&quot;, &quot;turmeric&quot;, or &quot;oil&quot;.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearAllFilters}
                        className="px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPostRequirementOpen(true)}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                      >
                        Post Requirement Instead
                      </button>
                    </div>
                  </div>
                ) : layoutMode === "grid" ? (
                  /* Grid Mode */
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isSaved={savedIds.includes(prod.id)}
                        onToggleSave={handleToggleSave}
                        onEnquire={(p) => setSelectedProductForEnquiry(p)}
                        onViewSupplier={(p) => {
                          const sup = SELLER_DIRECTORY.find((s) => s.id === p.sellerId || s.name === p.sellerName);
                          setSelectedSupplierForModal(
                            sup || {
                              id: p.sellerId,
                              name: p.sellerName,
                              sellerType: "Verified Producer",
                              district: p.originDistrict || p.district,
                              verified: true,
                            }
                          );
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  /* List Mode */
                  <div className="space-y-3">
                    {filteredProducts.map((prod) => (
                      <ProductRow
                        key={prod.id}
                        product={prod}
                        isSaved={savedIds.includes(prod.id)}
                        onToggleSave={handleToggleSave}
                        onEnquire={(p) => setSelectedProductForEnquiry(p)}
                        onViewSupplier={(p) => {
                          const sup = SELLER_DIRECTORY.find((s) => s.id === p.sellerId || s.name === p.sellerName);
                          setSelectedSupplierForModal(
                            sup || {
                              id: p.sellerId,
                              name: p.sellerName,
                              sellerType: "Verified Producer",
                              district: p.originDistrict || p.district,
                              verified: true,
                            }
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Slide-out Drawer for Filters */}
      <FilterPanel
        isMobileModal={true}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={{
          categories: selectedCategory ? [selectedCategory] : [],
          subcategories: selectedSubcategory ? [selectedSubcategory] : [],
          districts: selectedDistricts,
          grades: selectedGrades,
          availabilities: selectedAvailabilities,
          organicStatuses: selectedOrganic,
          moqRange: selectedMoq,
        }}
        onFilterChange={(field, val) => {
          if (field === "categories") setSelectedCategory(val[0] || "");
          if (field === "subcategories") setSelectedSubcategory(val[0] || "");
          if (field === "districts") setSelectedDistricts(val);
          if (field === "grades") setSelectedGrades(val);
          if (field === "availabilities") setSelectedAvailabilities(val);
          if (field === "organicStatuses") setSelectedOrganic(val);
          if (field === "moqRange") setSelectedMoq(val);
        }}
        onClearFilters={handleClearAllFilters}
      />

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Reusable Modals */}
      <SellerAccessModal
        isOpen={isSellerAccessOpen}
        onClose={() => setIsSellerAccessOpen(false)}
      />

      <PostRequirementModal
        isOpen={isPostRequirementOpen}
        onClose={() => setIsPostRequirementOpen(false)}
      />

      <SupplierProfileModal
        isOpen={!!selectedSupplierForModal}
        supplier={selectedSupplierForModal}
        onClose={() => setSelectedSupplierForModal(null)}
        onOpenSendEnquiry={(p) => setSelectedProductForEnquiry(p)}
      />

      <SendEnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
      />

      <BuyerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
