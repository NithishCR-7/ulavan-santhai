"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { BRD_CATEGORIES } from "@/data/marketplaceCatalog";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import { HomeIcon, ChevronRightIcon, ArrowRightIcon, SproutIcon } from "@/components/marketplace/Icons";

export default function BuyerCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading categories...
        </div>
      }
    >
      <BuyerCategoriesContent />
    </Suspense>
  );
}

function BuyerCategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("id") || "";

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    catParam || "agricultural-products"
  );
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAllProducts(res.data);
        }
      } catch {}
      finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory =
    BRD_CATEGORIES.find((c) => c.id === selectedCategoryId) || BRD_CATEGORIES[0];

  // Products belonging to the selected category fetched from backend
  const categoryProducts = allProducts.filter((p) => {
    const catName = p.category?.toLowerCase() || "";
    const activeName = activeCategory.name.toLowerCase();
    if (activeName.includes("agricultural")) return catName.includes("agri") || catName.includes("products");
    if (activeName.includes("organic")) return catName.includes("organic") || p.organic === true;
    if (activeName.includes("raw")) return catName.includes("raw") || catName.includes("materials");
    if (activeName.includes("ingredient")) return catName.includes("ingredient") || catName.includes("additive");
    if (activeName.includes("value")) return catName.includes("value") || catName.includes("flour") || catName.includes("processed");
    return catName === activeName;
  });

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
      />

      {/* 2. Main Container with Sidebar + Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: Category Guide & Discovery */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Categories</span>
              <span>&gt;</span>
              <span className="text-[#174B35] font-semibold">{activeCategory.name}</span>
            </nav>

            {/* Category Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BRD_CATEGORIES.map((cat) => {
                const isActive = cat.id === activeCategory.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "bg-[#174B35] text-white border-[#174B35] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs font-bold truncate block">{cat.name}</span>
                    <span className={`text-[10px] mt-1 ${isActive ? "text-emerald-200" : "text-gray-400"}`}>
                      {cat.count} listings
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Category Hero Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 relative h-48 md:h-auto min-h-[200px] bg-gray-100">
                  <Image
                    src={activeCategory.image}
                    alt={activeCategory.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent md:hidden" />
                  <div className="absolute bottom-3 left-3 text-white md:hidden font-bold text-sm">
                    {activeCategory.name}
                  </div>
                </div>

                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Value Chain Category &bull; {activeCategory.tamilName}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
                      {activeCategory.name}
                    </h1>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {activeCategory.description}
                    </p>
                  </div>

                  {/* Subcategories list */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Available Subcategories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCategory.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/marketplace?category=${encodeURIComponent(activeCategory.name)}&sub=${encodeURIComponent(sub)}`}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#E8F0E3] hover:text-[#174B35] text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>{sub}</span>
                          <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/marketplace?category=${encodeURIComponent(activeCategory.name)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Explore all {activeCategory.name}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Products under this category */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900">
                  Featured in {activeCategory.name}
                </h2>
                <Link
                  href={`/marketplace?category=${encodeURIComponent(activeCategory.name)}`}
                  className="text-xs font-bold text-[#174B35] hover:underline flex items-center gap-1"
                >
                  <span>View All in Marketplace</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onEnquire={() => setSelectedProductForEnquiry(p)}
                      onViewSupplier={() => setSelectedSupplierForModal(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  <SproutIcon className="w-8 h-8 text-[#174B35] mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    No listings directly classified under this exact view. Browse the main marketplace.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <BottomTabBar />

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
    </div>
  );
}

