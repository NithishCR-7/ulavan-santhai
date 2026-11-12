"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
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
} from "@/data/marketplaceCatalog";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getBuyerAccessEntitlement,
  recordSellerAccess,
} from "@/services/sellerAccessApi";
import {
  SearchIcon,
  GridIcon,
  HeartIcon,
  MailIcon,
  UserIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TagIcon,
  InfoIcon,
} from "@/components/marketplace/Icons";

export default function BuyerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading buyer dashboard...
        </div>
      }
    >
      <BuyerDashboardContent />
    </Suspense>
  );
}

function BuyerDashboardContent() {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [quotaRemaining, setQuotaRemaining] = useState(7);
  const [quotaUsed, setQuotaUsed] = useState(3);
  const [quotaTotal, setQuotaTotal] = useState(10);

  // Modals state
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

  // Load live entitlement
  useEffect(() => {
    let isMounted = true;
    async function loadEntitlement() {
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const ent = await getBuyerAccessEntitlement(buyerId);
        if (isMounted && ent) {
          if (typeof ent.viewsRemaining === "number") setQuotaRemaining(ent.viewsRemaining);
          if (typeof ent.viewsUsed === "number") setQuotaUsed(ent.viewsUsed);
          if (typeof ent.totalViews === "number") setQuotaTotal(ent.totalViews);
        }
      } catch (e) {}
    }
    loadEntitlement();
    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  const handleOpenEnquiry = async (product) => {
    setSelectedProductForEnquiry(product);
    try {
      const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
      const sellerId = product.sellerId || product.supplierId || "SELLER_GENERAL";
      const accessRes = await recordSellerAccess(buyerId, sellerId, {
        productTitle: product.title,
        sellerName: product.sellerName,
      });
      if (accessRes && typeof accessRes.viewsRemaining === "number") {
        setQuotaRemaining(accessRes.viewsRemaining);
        setQuotaUsed(accessRes.viewsUsed || quotaUsed + 1);
      }
    } catch (e) {}
  };

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingProducts(true);
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch {}
      finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenSupplierProfile = (product) => {
    setSelectedSupplierForModal(
      product.seller || {
        id: product.sellerId || "SUP_VERIFIED",
        name: product.sellerName || "Verified Agricultural Producer",
        district: product.originDistrict || "Tamil Nadu",
        sellerType: "Verified Agricultural Producer",
        verified: true,
      }
    );
  };

  const displayName = sessionUser?.name || "Sherlin A";
  const displayClassification = sessionUser?.buyerType || sessionUser?.role || "Food Processor";

  // Featured 4 products fetched strictly from backend API
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main Container with Sidebar + Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: Dashboard Sections */}
          <section className="md:col-span-8 lg:col-span-9 space-y-8">
            {/* A. Welcome Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold mb-2">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Buyer Account: {displayClassification}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Welcome back, {displayName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">
                    Source verified agricultural produce, raw materials, and value-added ingredients directly from producers across Tamil Nadu.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Explore Products</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* B. Marketplace Search Bar */}
              <div className="pt-2">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center rounded-2xl border border-gray-300 bg-gray-50/60 focus-within:bg-white focus-within:border-[#174B35] overflow-hidden shadow-2xs transition-all"
                >
                  <div className="pl-4 text-gray-400">
                    <SearchIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by commodity name, variety, grade, origin, or supplier..."
                    className="w-full h-12 px-3 text-xs sm:text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="h-12 px-6 bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Search Catalog
                  </button>
                </form>
              </div>
            </div>

            {/* E. Seller Access Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 text-[#174B35]" />
                    <span>Seller Access Entitlement</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Initial membership includes 10 unique supplier contact reveals. Repeat enquiries do not consume access.
                  </p>
                </div>

                <Link
                  href="/buyer/subscription"
                  className="text-xs font-bold text-[#174B35] hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  <span>Access History &amp; Top-up</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Total Quota
                  </span>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    {quotaTotal} Sellers
                  </div>
                  <span className="text-[11px] text-gray-400">Included in Rs 365 membership</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Unique Sellers Accessed
                  </span>
                  <div className="text-2xl font-black text-[#174B35] mt-1">
                    {quotaUsed}
                  </div>
                  <span className="text-[11px] text-emerald-700">Unlocked &amp; contactable</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Remaining Accesses
                  </span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {quotaRemaining}
                  </div>
                  <span className="text-[11px] text-amber-700">+10 pack available for Rs 10</span>
                </div>
              </div>
            </div>

            {/* C. Category Discovery Section (The 5 BRD Categories with Accurate Photography) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    Product Categories
                  </h2>
                  <p className="text-xs text-gray-500">
                    Explore products across the 5 structured agricultural value chain categories.
                  </p>
                </div>
                <Link
                  href="/buyer/categories"
                  className="text-xs font-bold text-[#174B35] hover:underline flex items-center gap-1"
                >
                  <span>View All Categories</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BRD_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                    className="group bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#174B35]/40 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <span className="text-xs font-extrabold block leading-tight drop-shadow-sm">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-emerald-200 font-medium">
                          {cat.tamilName} &bull; {cat.count} listings
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cat.subcategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub}
                            className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* D. Featured Products Discovery Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    Featured Produce &amp; Raw Materials
                  </h2>
                  <p className="text-xs text-gray-500">
                    High-volume agricultural lots ready for immediate procurement.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="text-xs font-bold text-[#174B35] hover:underline flex items-center gap-1"
                >
                  <span>Browse All Products</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
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
            </div>

            {/* F. Quick Navigation Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/marketplace"
                className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-[#174B35] hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GridIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900">Explore Marketplace</span>
              </Link>

              <Link
                href="/buyer/saved"
                className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-[#174B35] hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HeartIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900">Saved Products</span>
              </Link>

              <Link
                href="/buyer/enquiries"
                className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-[#174B35] hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MailIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900">My Enquiries</span>
              </Link>

              <Link
                href="/buyer/profile"
                className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-[#174B35] hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900">Buyer Profile</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomTabBar />

      {/* Modals */}
      <SendEnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
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

