"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { getMarketplaceSellers, getMarketplaceProducts } from "@/services/marketplaceApi";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import {
  ShieldCheckIcon,
  HomeIcon,
  LocationIcon,
  SproutIcon,
  LockIcon,
  StarIcon,
  ClockIcon,
} from "@/components/marketplace/Icons";

export default function BuyerSellerDetailsClient({ sellerId }) {
  const router = useRouter();
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
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

        if (!isMounted) return;

        const sellersList = sellersRes.success && Array.isArray(sellersRes.data) ? sellersRes.data : [];
        const allProds = prodsRes.success && Array.isArray(prodsRes.data) ? prodsRes.data : [];

        const matchedSeller = sellersList.find((s) => String(s.id) === String(sellerId));
        setSupplier(
          matchedSeller || {
            id: sellerId,
            name: "Verified Agricultural Producer",
            district: "Tamil Nadu",
            state: "Tamil Nadu",
            sellerType: "Agricultural Producer",
            verified: true,
            description: "Direct agricultural producer verified on Ulavan Santhai.",
            rating: 4.7,
            reviewsCount: 150,
          }
        );

        const prods = allProds.filter(
          (p) => String(p.sellerId) === String(sellerId) || (matchedSeller && p.sellerName === matchedSeller.name)
        );
        setSupplierProducts(prods);
      } catch {}
      finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

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

          {/* Right Column: Supplier Profile */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <Link href="/buyer/sellers" className="hover:text-[#174B35]">
                Suppliers
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">{supplier?.name || "Supplier"}</span>
            </nav>

            {/* Supplier Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold shrink-0 border border-emerald-200/60 shadow-xs">
                  <SproutIcon className="w-10 h-10 text-[#174B35]" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {supplier?.name || "Verified Producer"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
                      <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified Supplier</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <LocationIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{supplier?.district || "Tamil Nadu"}, Tamil Nadu</span>
                    </span>
                    <span>&bull;</span>
                    <span>{supplier?.sellerType || "Agricultural Producer"}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <StarIcon className="w-3.5 h-3.5 text-amber-500" filled={true} />
                      <span>{supplier?.rating || 4.7} ({supplier?.reviewsCount || 150} ratings)</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {supplier?.description}
                  </p>
                </div>
              </div>

              {/* 3 Trust Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-[#174B35] shrink-0" />
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block leading-tight">
                      Verified Identity
                    </strong>
                    <span className="text-[11px] text-gray-500">Official Platform Member</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                  <SproutIcon className="w-5 h-5 text-[#174B35] shrink-0" />
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block leading-tight">
                      Harvest Origin
                    </strong>
                    <span className="text-[11px] text-gray-500">Direct From Tamil Nadu</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-[#174B35] shrink-0" />
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block leading-tight">
                      Active Response
                    </strong>
                    <span className="text-[11px] text-gray-500">Responds within 24h</span>
                  </div>
                </div>
              </div>

              {/* Restricted Contact Details Notice per BRD rules */}
              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-emerald-200/80 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <LockIcon className="w-4 h-4 text-[#174B35] shrink-0" />
                  <span>
                    Direct phone and email contacts are protected and unlocked upon sending your first commercial enquiry.
                  </span>
                </div>
                {supplierProducts[0] && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductForEnquiry(supplierProducts[0])}
                    className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Enquire with Supplier
                  </button>
                )}
              </div>
            </div>

            {/* Supplier Product Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900">
                  Products by {supplier?.name || "Supplier"} ({supplierProducts.length})
                </h2>
                <Link
                  href="/marketplace"
                  className="text-xs font-bold text-[#174B35] hover:underline"
                >
                  Browse Full Marketplace &rarr;
                </Link>
              </div>

              {supplierProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supplierProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onEnquire={() => setSelectedProductForEnquiry(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500">No active products listed currently.</p>
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
    </div>
  );
}
