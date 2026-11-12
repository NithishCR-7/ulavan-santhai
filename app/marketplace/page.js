"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import FilterPanel from "@/components/marketplace/FilterPanel";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import BottomTabBar from "@/components/marketplace/BottomTabBar";

import {
  BRD_CATEGORIES,
  sortCatalogProducts,
} from "@/data/marketplaceCatalog";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import {
  recordSellerAccess,
  getBuyerAccessEntitlement,
} from "@/services/sellerAccessApi";
import { useSessionUser } from "@/services/sessionAuth";
import {
  BuildingIcon,
  UserIcon,
  PackageIcon,
  TagIcon,
  GridIcon,
  CheckCircleIcon,
  InfoIcon,
  FilterIcon,
  SproutIcon,
  LeafIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@/components/marketplace/Icons";

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading agricultural marketplace catalog...
        </div>
      }
    >
      <MarketplaceApp />
    </Suspense>
  );
}

const BUYER_CLASSIFICATIONS = [
  { id: "Food Processor", label: "Food Processor", icon: BuildingIcon },
  { id: "Individual", label: "Individual", icon: UserIcon },
  { id: "Business", label: "Business", icon: BuildingIcon },
  { id: "Manufacturer", label: "Manufacturer", icon: PackageIcon },
  { id: "Bakery or Food Business", label: "Bakery or Food Business", icon: TagIcon },
  { id: "Reseller", label: "Reseller", icon: GridIcon },
  { id: "Other", label: "Other", icon: PackageIcon },
];

function MarketplaceApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useSessionUser();

  // URL search params
  const paramSearch = searchParams.get("search") || searchParams.get("q") || "";
  const paramCat = searchParams.get("category") || "";
  const paramSub = searchParams.get("sub") || searchParams.get("subcategory") || "";

  // Products strictly fetched from backend API
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchBackendProducts() {
      setIsLoading(true);
      setBackendError("");
      try {
        const res = await getMarketplaceProducts();
        if (isMounted) {
          if (res.success && Array.isArray(res.data)) {
            setAllProducts(res.data);
          } else {
            setAllProducts([]);
            if (res.error) setBackendError(res.error);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAllProducts([]);
          setBackendError(err.message || "Failed to load products from backend.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchBackendProducts();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Modals state
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Saved / Wishlist items
  const [savedProductIds, setSavedProductIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("ulavan_saved_products");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync quota from entitlement API
  useEffect(() => {
    let isMounted = true;
    async function fetchQuota() {
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const ent = await getBuyerAccessEntitlement(buyerId);
        if (isMounted && ent && typeof ent.viewsRemaining === "number") {
          setQuotaRemaining(ent.viewsRemaining);
        }
      } catch (e) {}
    }
    fetchQuota();
    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  // Keep search params in sync
  useEffect(() => {
    if (paramSearch !== searchQuery) setSearchQuery(paramSearch);
    if (paramCat !== selectedCategory) setSelectedCategory(paramCat);
    if (paramSub !== selectedSubcategory) setSelectedSubcategory(paramSub);
  }, [paramSearch, paramCat, paramSub]);

  // Wishlist Toggle
  const handleToggleSave = (product) => {
    setSavedProductIds((prev) => {
      let next;
      if (prev.includes(product.id)) {
        next = prev.filter((id) => id !== product.id);
      } else {
        next = [...prev, product.id];
      }
      try {
        localStorage.setItem("ulavan_saved_products", JSON.stringify(next));
        window.dispatchEvent(new Event("ulavan_saved_changed"));
      } catch (e) {}
      return next;
    });
  };

  // Change buyer classification
  const handleSelectClassification = (clsId) => {
    setBuyerClassification(clsId);
    setIsClassificationDropdownOpen(false);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("ulavan_buyer_classification", clsId);
        localStorage.setItem("ulavan_buyer_classification", clsId);
      } catch (e) {}
    }
  };

  // Filter & Personalisation Engine (Strict BRD Rule: single shared catalog re-ranked by buyer type)
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        return (
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.commodity?.toLowerCase().includes(q) ||
          p.originDistrict?.toLowerCase().includes(q) ||
          p.originState?.toLowerCase().includes(q) ||
          p.sellerName?.toLowerCase().includes(q) ||
          p.variety?.toLowerCase().includes(q)
        );
      });
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== "All Categories") {
      list = list.filter((p) => {
        const catName = p.category?.toLowerCase() || "";
        const selName = selectedCategory.toLowerCase();
        if (selName.includes("agricultural")) return catName.includes("agri") || catName.includes("products");
        if (selName.includes("organic")) return catName.includes("organic") || p.organic === true;
        if (selName.includes("raw")) return catName.includes("raw") || catName.includes("materials");
        if (selName.includes("ingredient")) return catName.includes("ingredient") || catName.includes("additive");
        if (selName.includes("value")) return catName.includes("value") || catName.includes("flour") || catName.includes("processed");
        return catName === selName;
      });
    }

    // 3. Subcategory Filter
    if (selectedSubcategory) {
      list = list.filter((p) => {
        return (
          p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase() ||
          p.displayCategory?.toLowerCase() === selectedSubcategory.toLowerCase()
        );
      });
    }

    // 4. Origin Districts
    if (selectedDistricts.length > 0) {
      list = list.filter((p) => {
        const d = (p.originDistrict || p.originState || "").toLowerCase();
        return selectedDistricts.some((sel) => d.includes(sel.toLowerCase()));
      });
    }

    // 5. Grades
    if (selectedGrades.length > 0) {
      list = list.filter((p) => {
        const g = (p.grade || "").toLowerCase();
        return selectedGrades.some((sel) => g.includes(sel.toLowerCase()));
      });
    }

    // 6. Availability
    if (selectedAvailabilities.length > 0) {
      list = list.filter((p) => {
        const a = (p.availability || "In Stock").toLowerCase();
        return selectedAvailabilities.some((sel) => a.includes(sel.toLowerCase()));
      });
    }

    // 7. Verified Only
    if (verifiedOnly) {
      list = list.filter((p) => p.verifiedSeller === true || p.verified === true);
    }

    // 8. Sorting & Personalization Re-ranking
    return sortCatalogProducts(list, sortBy, buyerClassification);
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedDistricts,
    selectedGrades,
    selectedAvailabilities,
    verifiedOnly,
    sortBy,
    buyerClassification,
  ]);

  // Handle Enquiry Trigger
  const handleOpenEnquiry = async (product) => {
    setSelectedProductForEnquiry(product);
    // Deduct 1 unique seller access
    try {
      const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
      const sellerId = product.sellerId || product.supplierId || "SELLER_GENERAL";
      const accessRes = await recordSellerAccess(buyerId, sellerId, {
        productTitle: product.title,
        sellerName: product.sellerName,
      });
      if (accessRes && typeof accessRes.viewsRemaining === "number") {
        setQuotaRemaining(accessRes.viewsRemaining);
      }
    } catch (e) {}
  };

  // Handle Supplier Profile Trigger
  const handleOpenSupplierProfile = (product) => {
    const sup = SELLER_DIRECTORY.find((s) => s.id === product.sellerId || s.name === product.sellerName);
    setSelectedSupplierForModal(
      sup || {
        id: product.sellerId || "SUP_VERIFIED",
        name: product.sellerName || "Verified Agricultural Producer",
        district: product.originDistrict || "Tamil Nadu",
        sellerType: "Verified Agricultural Producer",
        verified: true,
      }
    );
  };

  // Clear All Filters
  const handleClearAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedDistricts([]);
    setSelectedGrades([]);
    setSelectedAvailabilities([]);
    setSelectedOrganic([]);
    setSelectedMoq("all");
    setVerifiedOnly(false);
    setSearchQuery("");
  };

  const currentClassificationObj =
    BUYER_CLASSIFICATIONS.find((c) => c.id === buyerClassification) || BUYER_CLASSIFICATIONS[0];
  const ClassificationIcon = currentClassificationObj.icon;

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header (Sticky navigation matching Screenshot 6) */}
      <BuyerHeader
        initialSearch={searchQuery}
        initialCategory={selectedCategory || "All Categories"}
        onSearch={(q, cat) => {
          setSearchQuery(q);
          if (cat && cat !== "All Categories") setSelectedCategory(cat);
          else setSelectedCategory("");
        }}
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Panoramic Hero Banner matching Screenshot 6 */}
      <section className="relative w-full h-36 sm:h-44 md:h-52 bg-[#174B35] overflow-hidden flex items-center">
        {/* Farm Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-aerial-fields.jpg"
            alt="Lush green panoramic agricultural fields and harvest farmland"
            fill
            priority
            className="object-cover object-center brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#103A29]/80 via-[#174B35]/50 to-transparent" />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Source quality agricultural products
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-xl drop-shadow-xs">
            Directly connect with verified farmers, FPOs, and certified agri-producers across Tamil Nadu.
          </p>
        </div>
      </section>

      {/* 3. Main Workspace: Dual-Card Left Sidebar + 4-Column Product Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Categories & Filters (Screenshot 6 Layout)  */}
          {/* ======================================================== */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5">
            <FilterPanel
              filters={{
                category: selectedCategory,
                categories: selectedCategory ? [selectedCategory] : [],
                subcategories: selectedSubcategory ? [selectedSubcategory] : [],
                district: selectedDistricts[0] || "All Districts",
                districts: selectedDistricts,
                grade: selectedGrades[0] || "all",
                grades: selectedGrades,
                availability: selectedAvailabilities[0] || "all",
                availabilities: selectedAvailabilities,
                organicStatus: selectedOrganic[0] || "all",
                moq: selectedMoq,
                verifiedOnly: verifiedOnly,
              }}
              onChange={(updated) => {
                if (updated.categories) setSelectedCategory(updated.categories[0] || "");
                if (updated.category !== undefined) setSelectedCategory(updated.category);
                if (updated.subcategories) setSelectedSubcategory(updated.subcategories[0] || "");
                if (updated.districts) setSelectedDistricts(updated.districts);
                if (updated.grades) setSelectedGrades(updated.grades);
                if (updated.availabilities) setSelectedAvailabilities(updated.availabilities);
                if (updated.verifiedOnly !== undefined) setVerifiedOnly(updated.verifiedOnly);
              }}
              onClearAll={handleClearAllFilters}
            />
          </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Toolbar & 4-Column Product Card Grid       */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top Toolbar matching Screenshot 6: Marketplace | Dropdown | Quota Pill | Sort */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left: Heading + Role Switcher + Quota Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Marketplace
                </h2>

                {/* Buyer Classification Dropdown Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsClassificationDropdownOpen(!isClassificationDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer"
                    title="Change buyer procurement classification"
                  >
                    <ClassificationIcon className="w-3.5 h-3.5 text-[#174B35]" />
                    <span>{currentClassificationObj.label}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Dropdown Menu for 7 Buyer Types */}
                  {isClassificationDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-1.5 z-40 text-xs animate-in fade-in duration-100">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Buyer Classification
                      </div>
                      {BUYER_CLASSIFICATIONS.map((c) => {
                        const Icon = c.icon;
                        const isSelected = buyerClassification === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClassification(c.id)}
                            className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-emerald-50 text-[#174B35] font-bold"
                                : "text-gray-700 hover:bg-gray-50 font-medium"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-[#174B35]" />
                            <span className="flex-1">{c.label}</span>
                            {isSelected && <CheckIcon className="w-3.5 h-3.5 text-[#174B35]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Seller Access Pill */}
                <button
                  type="button"
                  onClick={() => setIsSellerAccessOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold hover:bg-emerald-100/80 transition-colors cursor-pointer"
                  title="Click to view seller access rules & remaining quota"
                >
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Seller enquiries remaining: {quotaRemaining} of 10</span>
                  <InfoIcon className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
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
                  <FilterIcon className="w-3.5 h-3.5" />
                  <span>Filters</span>
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

            {/* 4-Column Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl border border-gray-200 p-4 h-80 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-full h-40 bg-gray-200 rounded-xl" />
                    <div className="space-y-2 mt-3">
                      <div className="w-3/4 h-4 bg-gray-200 rounded" />
                      <div className="w-1/2 h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedProductIds.includes(product.id)}
                    onToggleSave={handleToggleSave}
                    onEnquire={handleOpenEnquiry}
                    onViewSupplier={handleOpenSupplierProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-[#174B35]">
                  <SproutIcon className="w-8 h-8 text-[#174B35]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {backendError ? "Backend Connection Notice" : "No agricultural products found"}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {backendError ||
                    (allProducts.length === 0
                      ? "No active products returned from backend."
                      : "Try clearing active filters or selecting another commodity category.")}
                </p>
                {allProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Bottom Notice Strip */}
            <div className="rounded-2xl bg-[#E8F0E3]/70 border border-[#174B35]/20 p-4 flex items-center justify-between gap-4 text-xs text-[#174B35] font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0">
                  <InfoIcon className="w-3.5 h-3.5 text-white" />
                </span>
                <span>
                  One enquiry to a new seller uses one seller access. Repeat enquiries to the same seller do not use another.
                </span>
              </div>
              <div className="hidden sm:block opacity-40 shrink-0">
                <LeafIcon className="w-5 h-5 text-[#174B35]" />
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
          district: selectedDistricts[0] || "All Districts",
          districts: selectedDistricts,
          grade: selectedGrades[0] || "all",
          grades: selectedGrades,
          availability: selectedAvailabilities[0] || "all",
          availabilities: selectedAvailabilities,
          organicStatus: selectedOrganic[0] || "all",
          moq: selectedMoq,
          verifiedOnly: verifiedOnly,
        }}
        onChange={(updated) => {
          if (updated.categories) setSelectedCategory(updated.categories[0] || "");
          if (updated.category !== undefined) setSelectedCategory(updated.category);
          if (updated.subcategories) setSelectedSubcategory(updated.subcategories[0] || "");
          if (updated.districts) setSelectedDistricts(updated.districts);
          if (updated.grades) setSelectedGrades(updated.grades);
          if (updated.availabilities) setSelectedAvailabilities(updated.availabilities);
          if (updated.verifiedOnly !== undefined) setVerifiedOnly(updated.verifiedOnly);
        }}
        onClearAll={handleClearAllFilters}
      />

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* 4. Modals */}
      <SendEnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
        onSuccess={() => {
          setSelectedProductForEnquiry(null);
        }}
      />

      <SupplierProfileModal
        isOpen={!!selectedSupplierForModal}
        supplier={selectedSupplierForModal}
        onClose={() => setSelectedSupplierForModal(null)}
      />

      <SellerAccessModal
        isOpen={isSellerAccessOpen}
        onClose={() => setIsSellerAccessOpen(false)}
      />

      <PostRequirementModal
        isOpen={isPostRequirementOpen}
        onClose={() => setIsPostRequirementOpen(false)}
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
