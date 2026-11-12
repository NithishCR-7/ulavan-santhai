"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { getMarketplaceSellers, getMarketplaceProducts } from "@/services/marketplaceApi";
import {
  ShieldCheckIcon,
  HomeIcon,
  LocationIcon,
  TagIcon,
  SearchIcon,
  ArrowRightIcon,
  MailIcon,
  SproutIcon,
} from "@/components/marketplace/Icons";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";

export default function BuyerSellersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading suppliers directory...
        </div>
      }
    >
      <BuyerSellersContent />
    </Suspense>
  );
}

function BuyerSellersContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [sellersRes, prodsRes] = await Promise.all([
          getMarketplaceSellers(),
          getMarketplaceProducts(),
        ]);
        if (isMounted) {
          if (sellersRes.success && Array.isArray(sellersRes.data)) {
            setSellers(sellersRes.data);
          }
          if (prodsRes.success && Array.isArray(prodsRes.data)) {
            setAllProducts(prodsRes.data);
          }
        }
      } catch {}
      finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSuppliers = sellers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.district || "").toLowerCase().includes(q) ||
      (s.sellerType || "").toLowerCase().includes(q)
    );
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

          {/* Right Column: Suppliers Directory */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Verified Suppliers</span>
            </nav>

            {/* Header with Search */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Verified Agricultural Suppliers
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Connect directly with verified farmers, FPOs, mills, and agricultural producers across Tamil Nadu.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="px-4 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-colors self-start sm:self-center shrink-0"
                >
                  Explore Products &rarr;
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by producer name, district, or product type..."
                  className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-gray-300 focus:border-[#174B35] outline-none bg-gray-50/50 focus:bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Suppliers Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSuppliers.map((supplier) => {
                const prods = allProducts.filter(
                  (p) => p.sellerId === supplier.id || p.sellerName === supplier.name
                );

                return (
                  <div
                    key={supplier.id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-4 flex flex-col justify-between hover:border-gray-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold shrink-0">
                            <SproutIcon className="w-6 h-6 text-[#174B35]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
                              {supplier.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <LocationIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span>{supplier.district}, Tamil Nadu</span>
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60 shrink-0">
                          <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
                          <span>Verified</span>
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {supplier.description}
                      </p>

                      {/* Commodities / Listed items */}
                      {Array.isArray(supplier.commodities) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {supplier.commodities.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSupplierForModal(supplier)}
                        className="text-xs font-bold text-[#174B35] hover:underline cursor-pointer"
                      >
                        View Seller Profile &rarr;
                      </button>

                      {prods[0] && (
                        <button
                          type="button"
                          onClick={() => setSelectedProductForEnquiry(prods[0])}
                          className="px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Enquire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <BottomTabBar />

      <SupplierProfileModal
        isOpen={!!selectedSupplierForModal}
        supplier={selectedSupplierForModal}
        onClose={() => setSelectedSupplierForModal(null)}
        onOpenSendEnquiry={(p) => {
          setSelectedProductForEnquiry(p);
          setSelectedSupplierForModal(null);
        }}
      />

      <SendEnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
      />
    </div>
  );
}

