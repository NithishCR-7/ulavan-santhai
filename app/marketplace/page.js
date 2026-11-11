"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import ProductCard from "@/components/marketplace/ProductCard";
import FilterPanel from "@/components/marketplace/FilterPanel";
import FilterChips from "@/components/marketplace/FilterChips";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import {
  BRD_CATEGORIES,
  SELLER_DIRECTORY,
  B2B_CATALOG_PRODUCTS,
} from "@/data/marketplaceCatalog";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import { useSessionUser } from "@/services/sessionAuth";
import { getLocalBuyerAccessState } from "@/services/sellerAccessApi";

export default function BuyerMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading Ulavan Santhai Agricultural Marketplace...
        </div>
      }
    >
      <MarketplaceApp />
    </Suspense>
  );
}

const BUYER_CLASSIFICATIONS = [
  { id: "Food Processor", label: "Food Processor", icon: "🍱" },
  { id: "Individual", label: "Individual", icon: "👤" },
  { id: "Business", label: "Business", icon: "🏢" },
  { id: "Manufacturer", label: "Manufacturer", icon: "🏭" },
  { id: "Bakery or Food Business", label: "Bakery or Food Business", icon: "🥖" },
  { id: "Reseller", label: "Reseller", icon: "🏪" },
  { id: "Other", label: "Other", icon: "📦" },
];

function MarketplaceApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useSessionUser();

  // URL search params
  const paramSearch = searchParams.get("search") || searchParams.get("q") || "";
  const paramCat = searchParams.get("category") || "";
  const paramSub = searchParams.get("sub") || searchParams.get("subcategory") || "";

  // Products from catalog
  const [allProducts, setAllProducts] = useState(B2B_CATALOG_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

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

  // Sorting
  const [sortBy, setSortBy] = useState("RELEVANCE");

  // Buyer Classification Personalisation (7 types from BRD)
  const [buyerClassification, setBuyerClassification] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("ulavan_buyer_classification") ||
          localStorage.getItem("ulavan_buyer_classification");
        if (stored) return stored;
        const userRaw = sessionStorage.getItem("ulavan_user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u.buyerType) return u.buyerType;
        }
      } catch {}
    }
    return "Food Processor"; // Default shown in Screenshot 6
  });
  const [isClassificationDropdownOpen, setIsClassificationDropdownOpen] = useState(false);

  // Seller access quota state
  const [quotaRemaining, setQuotaRemaining] = useState(7); // "7 of 10" in Screenshot 6

  // User Saved & Wishlist state
  const [savedIds, setSavedIds] = useState([]);

  // Modals state
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Guard: if registered user has not completed Buyer onboarding & payment, redirect to onboarding step 1
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email || parsed.mobile || parsed.id) {
          const buyerDone = Boolean(
            parsed.buyerPaid ||
            parsed.buyerOnboarded ||
            (parsed.buyerData && parsed.isPaid && (parsed.role === "Buyer" || parsed.activeRole === "buyer"))
          );
          if (!buyerDone) {
            router.replace("/onboarding?role=buyer&step=1");
          }
        }
      }
    } catch {}
  }, [router]);

  // Load live catalog products on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge custom created products with B2B_CATALOG_PRODUCTS
          setAllProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync quota from local entitlement state
  useEffect(() => {
    const updateQuota = () => {
      const state = getLocalBuyerAccessState();
      if (state && typeof state.quotaRemaining === "number") {
        setQuotaRemaining(state.quotaRemaining);
      }
    };
    updateQuota();
    window.addEventListener("ulavan_access_changed", updateQuota);
    return () => window.removeEventListener("ulavan_access_changed", updateQuota);
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    if (paramSearch !== searchQuery) setSearchQuery(paramSearch);
    if (paramCat !== selectedCategory) setSelectedCategory(paramCat);
    if (paramSub !== selectedSubcategory) setSelectedSubcategory(paramSub);
  }, [paramSearch, paramCat, paramSub]);

  // Load saved items from localStorage
  const loadSavedData = () => {
    try {
      const rawSaved = localStorage.getItem("ulavan_saved_products");
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.map((p) => (typeof p === "string" ? p : p.id)));
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadSavedData();
    const handleSavedChanged = () => loadSavedData();
    window.addEventListener("ulavan_saved_changed", handleSavedChanged);
    return () => window.removeEventListener("ulavan_saved_changed", handleSavedChanged);
  }, []);

  // Toggle Save / Wishlist
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
    } catch {}
  };

  // Change Buyer Classification
  const handleSelectClassification = (typeId) => {
    setBuyerClassification(typeId);
    setIsClassificationDropdownOpen(false);
    try {
      sessionStorage.setItem("ulavan_buyer_classification", typeId);
      localStorage.setItem("ulavan_buyer_classification", typeId);
      const userRaw = sessionStorage.getItem("ulavan_user");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.buyerType = typeId;
        sessionStorage.setItem("ulavan_user", JSON.stringify(u));
      }
    } catch {}
  };

  // Clear all filters
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

  // Filter & Personalisation Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Text Search
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
          p.categoryId === selectedCategory ||
          p.displayCategory?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Subcategory / Product Type
    if (selectedSubcategory) {
      result = result.filter(
        (p) =>
          p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase() ||
          p.displayCategory?.toLowerCase() === selectedSubcategory.toLowerCase()
      );
    }

    // 4. District / Origin
    if (selectedDistricts.length > 0) {
      result = result.filter((p) =>
        selectedDistricts.some((d) => {
          const origin = (p.originDistrict || p.originState || p.district || "").toLowerCase();
          return origin.includes(d.toLowerCase());
        })
      );
    }

    // 5. Grade
    if (selectedGrades.length > 0) {
      result = result.filter((p) =>
        selectedGrades.some((g) => (p.grade || "").toLowerCase().includes(g.toLowerCase()))
      );
    }

    // 6. Availability
    if (selectedAvailabilities.length > 0) {
      result = result.filter((p) =>
        selectedAvailabilities.some((a) => p.availabilityStatus === a)
      );
    }

    // 7. Organic / Farming Type
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
        const moq = Number(p.minOrderQuantity || p.moq) || 0;
        if (selectedMoq === "< 100 kg") return moq < 100;
        if (selectedMoq === "100 - 500 kg") return moq >= 100 && moq <= 500;
        if (selectedMoq === "500 kg - 2 MT") return moq > 500 && moq <= 2000;
        if (selectedMoq === "> 2 MT (Bulk lots)") return moq > 2000;
        return true;
      });
    }

    // 9. Verified Only
    if (verifiedOnly) {
      result = result.filter((p) => p.sellerVerified === true || p.verified === true);
    }

    // 10. Personalisation based on Buyer Classification
    if (buyerClassification === "Food Processor") {
      // Prioritize fresh produce, pulses, spices, flours
      result.sort((a, b) => {
        const aBoost = ["Pulses", "Vegetables", "Spices", "Processed Foods"].includes(a.displayCategory || a.subcategory) ? -1 : 1;
        const bBoost = ["Pulses", "Vegetables", "Spices", "Processed Foods"].includes(b.displayCategory || b.subcategory) ? -1 : 1;
        return aBoost - bBoost;
      });
    } else if (buyerClassification === "Manufacturer") {
      // Prioritize raw materials, bulk milling grains, copra
      result.sort((a, b) => {
        const aBoost = a.category === "Raw Materials" || a.subcategory?.includes("Paddy") ? -1 : 1;
        const bBoost = b.category === "Raw Materials" || b.subcategory?.includes("Paddy") ? -1 : 1;
        return aBoost - bBoost;
      });
    } else if (buyerClassification === "Bakery or Food Business") {
      // Prioritize flours, starches, cold-pressed oils
      result.sort((a, b) => {
        const aBoost = a.title?.includes("Flour") || a.title?.includes("Oil") || a.title?.includes("Sago") ? -1 : 1;
        const bBoost = b.title?.includes("Flour") || b.title?.includes("Oil") || b.title?.includes("Sago") ? -1 : 1;
        return aBoost - bBoost;
      });
    } else if (buyerClassification === "Individual") {
      // Prioritize lower MOQ items
      result.sort((a, b) => (Number(a.minOrderQuantity) || 0) - (Number(b.minOrderQuantity) || 0));
    }

    // 11. Sorting
    if (sortBy === "RECENT") {
      result.sort((a, b) => new Date(b.harvestDate || b.lastUpdated || 0) - new Date(a.harvestDate || a.lastUpdated || 0));
    } else if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => (Number(a.pricePerUnit || a.price) || 0) - (Number(b.pricePerUnit || b.price) || 0));
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => (Number(b.pricePerUnit || b.price) || 0) - (Number(a.pricePerUnit || a.price) || 0));
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
    buyerClassification,
    sortBy,
  ]);

  const currentClassificationObj =
    BUYER_CLASSIFICATIONS.find((c) => c.id === buyerClassification) || BUYER_CLASSIFICATIONS[0];

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Top Navbar matching Screenshot 6 */}
      <BuyerHeader
        initialSearch={searchQuery}
        initialCategory={selectedCategory || "All Categories"}
        onSearch={(q) => {
          setSearchQuery(q);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Hero Banner matching Screenshot 6 */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 sm:h-44 md:h-52 flex items-center px-6 sm:px-10 lg:px-12 text-white">
          {/* Panoramic agricultural landscape background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero-aerial-fields.jpg')",
            }}
          />
          {/* Subtle gradient overlay to enhance readability */}
          <div className="absolute inset-0 bg-linear-to-r from-[#174B35]/85 via-[#174B35]/50 to-transparent" />

          {/* Banner Text Content */}
          <div className="relative z-10 max-w-xl space-y-1.5 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-xs">
              Source quality agricultural products
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium drop-shadow-xs">
              Discover quality agricultural products &amp; raw materials direct from verified producers
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Sidebar + Product Grid) matching Screenshot 6 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN (3 Cols): Categories + Filters Sidebar       */}
          {/* ======================================================== */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
            <FilterPanel
              filters={{
                category: selectedCategory,
                categories: selectedCategory ? [selectedCategory] : [],
                subcategories: selectedSubcategory ? [selectedSubcategory] : [],
                districts: selectedDistricts,
                grades: selectedGrades,
                availabilities: selectedAvailabilities,
                organicStatuses: selectedOrganic,
                moqRange: selectedMoq,
              }}
              onFilterChange={(field, val) => {
                if (field === "categories" || field === "category") {
                  setSelectedCategory(Array.isArray(val) ? val[0] || "" : val);
                  setSelectedSubcategory("");
                } else if (field === "subcategories") {
                  setSelectedSubcategory(val[0] || "");
                } else if (field === "districts") {
                  setSelectedDistricts(val);
                } else if (field === "grades") {
                  setSelectedGrades(val);
                } else if (field === "availabilities") {
                  setSelectedAvailabilities(val);
                } else if (field === "organicStatuses") {
                  setSelectedOrganic(val);
                } else if (field === "moqRange") {
                  setSelectedMoq(val);
                }
              }}
              onClearFilters={handleClearAllFilters}
            />
          </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (9 Cols): Top Bar + Product Grid + Notice   */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top Toolbar matching Screenshot 6 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              {/* Left: Heading + Buyer Type Selector + Seller Access Pill */}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Marketplace
                </h2>

                {/* Buyer Classification Dropdown Pill matching Screenshot 6 [🍱 Food Processor ▾] */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsClassificationDropdownOpen(!isClassificationDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer"
                    title="Change buyer procurement classification"
                  >
                    <span>{currentClassificationObj.icon}</span>
                    <span>{currentClassificationObj.label}</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu for 7 Buyer Types */}
                  {isClassificationDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-1.5 z-40 text-xs animate-in fade-in duration-100">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Buyer Classification
                      </div>
                      {BUYER_CLASSIFICATIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectClassification(c.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                            buyerClassification === c.id
                              ? "bg-emerald-50 text-[#174B35] font-bold"
                              : "text-gray-700 hover:bg-gray-50 font-medium"
                          }`}
                        >
                          <span>{c.icon}</span>
                          <span className="flex-1">{c.label}</span>
                          {buyerClassification === c.id && <span className="text-[#174B35] font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Access Pill matching Screenshot 6: [✓ Seller enquiries remaining: 7 of 10 ℹ] */}
                <button
                  type="button"
                  onClick={() => setIsSellerAccessOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold hover:bg-emerald-100/80 transition-colors cursor-pointer"
                  title="Click to view seller access rules & remaining quota"
                >
                  <span className="text-emerald-700">✓</span>
                  <span>Seller enquiries remaining: {quotaRemaining} of 10</span>
                  <span className="text-emerald-600 text-[11px] font-bold ml-0.5">ℹ</span>
                </button>
              </div>

              {/* Right: Sort by Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <span>⚙️ Filters</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 bg-white outline-none cursor-pointer hover:border-gray-400 focus:border-[#174B35]"
                  >
                    <option value="RELEVANCE">Relevance</option>
                    <option value="RECENT">Recently Added</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips if any filter is active */}
            {(selectedCategory || selectedSubcategory || selectedDistricts.length > 0 || selectedGrades.length > 0 || searchQuery) && (
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
            )}

            {/* Product Card Grid (4 Columns matching Screenshot 6) */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          sellerType: p.sellerType || "Verified Producer",
                          district: p.originDistrict || p.district,
                          verified: true,
                        }
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-3xl flex items-center justify-center mx-auto text-[#174B35]">
                  🌾
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No agricultural products match your filter criteria
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try clearing active filters or selecting another commodity category.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Bottom Notice Strip matching Screenshot 6 */}
            <div className="rounded-2xl bg-[#E8F0E3]/70 border border-[#174B35]/20 p-4 flex items-center justify-between gap-4 text-xs text-[#174B35] font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#174B35] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ℹ
                </span>
                <span>
                  One enquiry to a new seller uses one seller access. Repeat enquiries to the same seller do not use another.
                </span>
              </div>
              <div className="hidden sm:block opacity-40 shrink-0 text-xl">
                🍃
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer Filter Panel */}
      <FilterPanel
        isMobileModal={true}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={{
          category: selectedCategory,
          categories: selectedCategory ? [selectedCategory] : [],
          subcategories: selectedSubcategory ? [selectedSubcategory] : [],
          districts: selectedDistricts,
          grades: selectedGrades,
          availabilities: selectedAvailabilities,
          organicStatuses: selectedOrganic,
          moqRange: selectedMoq,
        }}
        onFilterChange={(field, val) => {
          if (field === "categories" || field === "category") {
            setSelectedCategory(Array.isArray(val) ? val[0] || "" : val);
            setSelectedSubcategory("");
          } else if (field === "subcategories") {
            setSelectedSubcategory(val[0] || "");
          } else if (field === "districts") {
            setSelectedDistricts(val);
          } else if (field === "grades") {
            setSelectedGrades(val);
          } else if (field === "availabilities") {
            setSelectedAvailabilities(val);
          } else if (field === "organicStatuses") {
            setSelectedOrganic(val);
          } else if (field === "moqRange") {
            setSelectedMoq(val);
          }
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