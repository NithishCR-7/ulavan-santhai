"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { getMarketplaceProducts } from "@/services/marketplaceApi";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import {
  HeartIcon,
  HomeIcon,
  TrashIcon,
  LocationIcon,
  PackageIcon,
  StarIcon,
  ShieldCheckIcon,
} from "@/components/marketplace/Icons";

export default function BuyerSavedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading saved products...
        </div>
      }
    >
      <BuyerSavedContent />
    </Suspense>
  );
}

function BuyerSavedContent() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ulavan_saved_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedIds(parsed);
      }
    } catch {}
    setIsLoading(false);

    const handleSavedChanged = () => {
      try {
        const stored = localStorage.getItem("ulavan_saved_products");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSavedIds(parsed);
        } else {
          setSavedIds([]);
        }
      } catch {}
    };

    window.addEventListener("ulavan_saved_changed", handleSavedChanged);
    return () => window.removeEventListener("ulavan_saved_changed", handleSavedChanged);
  }, []);

  const handleRemoveSaved = (productId) => {
    const next = savedIds.filter((id) => id !== productId);
    setSavedIds(next);
    try {
      localStorage.setItem("ulavan_saved_products", JSON.stringify(next));
      window.dispatchEvent(new Event("ulavan_saved_changed"));
    } catch {}
  };

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchBackendProducts() {
      try {
        const res = await getMarketplaceProducts();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAllProducts(res.data);
        }
      } catch {}
    }
    fetchBackendProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const savedProducts = allProducts.filter((p) => savedIds.includes(p.id));

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

          {/* Right Column: Saved Products Area */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Saved Products</span>
            </nav>

            {/* Page Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Saved Products ({savedProducts.length})
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Bookmarked produce lots for commercial review. Saving products does not consume seller access views.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="px-4 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-colors"
                >
                  Explore Marketplace &rarr;
                </Link>
              </div>
            </div>

            {/* Saved Products Grid / Empty State */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading saved items...</div>
            ) : savedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-3 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                  <HeartIcon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No saved products yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Click the heart icon on any agricultural produce card to bookmark it for later review or procurement comparison.
                </p>
                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="inline-flex px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-colors"
                  >
                    Browse Wholesale Marketplace &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
                      <Image
                        src={product.thumbnail || product.image || "/images/about-farmer-harvest.jpg"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(product.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-red-600 hover:bg-white flex items-center justify-center shadow-xs cursor-pointer"
                        title="Remove from saved products"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <Link href={`/marketplace/products/${product.id}`} className="block">
                          <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1 hover:text-[#174B35] transition-colors">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <LocationIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{product.originDistrict || "Tamil Nadu"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <StarIcon className="w-3.5 h-3.5 text-amber-500" filled={true} />
                          <span>Grade: {product.grade?.replace("Grade: ", "") || "A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <PackageIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>MOQ: {product.minOrderQuantity || 100} {product.unit || "kg"}</span>
                        </div>
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Verified Seller</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        <Link
                          href={`/marketplace/products/${product.id}`}
                          className="flex-1 py-2 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold text-center transition-colors block"
                        >
                          View Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedProductForEnquiry(product)}
                          className="flex-1 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Enquire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

