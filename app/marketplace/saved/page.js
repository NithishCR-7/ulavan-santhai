"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import { B2B_CATALOG_PRODUCTS, SELLER_DIRECTORY } from "@/data/marketplaceCatalog";

export default function SavedProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading saved commodities...
        </div>
      }
    >
      <SavedProductsContent />
    </Suspense>
  );
}

function SavedProductsContent() {
  const router = useRouter();

  const [savedProducts, setSavedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const loadSaved = () => {
    try {
      const raw = localStorage.getItem("ulavan_saved_products");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Resolve any IDs to full products if saved as string IDs
          const fullList = parsed.map((item) => {
            if (typeof item === "string") {
              return B2B_CATALOG_PRODUCTS.find((p) => p.id === item) || null;
            }
            return item;
          }).filter(Boolean);
          setSavedProducts(fullList);
        }
      } else {
        setSavedProducts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
    const handleStorage = () => loadSaved();
    window.addEventListener("ulavan_saved_changed", handleStorage);
    return () => window.removeEventListener("ulavan_saved_changed", handleStorage);
  }, []);

  const handleRemoveSaved = (prod) => {
    try {
      const raw = localStorage.getItem("ulavan_saved_products");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((item) => (typeof item === "string" ? item !== prod.id : item.id !== prod.id));
      localStorage.setItem("ulavan_saved_products", JSON.stringify(list));
      setSavedProducts(list.map((item) => (typeof item === "string" ? B2B_CATALOG_PRODUCTS.find((p) => p.id === item) : item)).filter(Boolean));
      window.dispatchEvent(new Event("ulavan_saved_changed"));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header (Sticky 2-row header) */}
      <BuyerHeader
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onSearch={(q, cat) => router.push(`/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/marketplace" className="hover:text-[#174B35] font-semibold">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Saved Products</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Saved Commodities &amp; Lots
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Keep track of agricultural produce, price trends, and verified lots for future procurement.
              </p>
            </div>

            <span className="font-extrabold text-sm text-[#174B35] bg-[#E8F0E3] px-3 py-1 rounded-full self-start sm:self-center">
              {savedProducts.length} Saved {savedProducts.length === 1 ? "Lot" : "Lots"}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading saved items...</div>
        ) : savedProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-3xl flex items-center justify-center mx-auto text-[#174B35]">
              🔖
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                No saved commodities yet
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                As you browse the marketplace, click the bookmark icon on any product to save it to your procurement shortlist.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex px-6 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] shadow-sm transition-all"
              >
                Browse Marketplace &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of Saved Products */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isSaved={true}
                onToggleSave={() => handleRemoveSaved(prod)}
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
      </main>

      {/* Mobile Bottom Tab Bar */}
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
        onOpenSendEnquiry={(p) => setSelectedProductForEnquiry(p)}
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
