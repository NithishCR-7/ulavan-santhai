"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import ImageGallery from "@/components/marketplace/ImageGallery";
import SupplierPanel from "@/components/marketplace/SupplierPanel";
import StatusBadge from "@/components/marketplace/StatusBadge";
import ProductCard from "@/components/marketplace/ProductCard";
import SendEnquiryModal from "@/components/marketplace/SendEnquiryModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import {
  getMarketplaceProductById,
  getMarketplaceProducts,
} from "@/services/marketplaceApi";
import {
  getLocalBuyerAccessState,
  unlockSellerContact,
} from "@/services/sellerAccessApi";
import { SELLER_DIRECTORY, B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

export default function ProductDetailsClient({ productId }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Seller access state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(10);
  const [isSaved, setIsSaved] = useState(false);

  // Modals state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [prodRes, catalogRes] = await Promise.all([
          getMarketplaceProductById(productId),
          getMarketplaceProducts(),
        ]);

        if (!isMounted) return;

        let foundProd = prodRes?.success ? prodRes.data : null;
        if (!foundProd) {
          foundProd = B2B_CATALOG_PRODUCTS.find((p) => p.id === productId);
        }

        if (foundProd) {
          setProduct(foundProd);

          // Track in "Continue where you left off"
          try {
            const rawRecent = localStorage.getItem("ulavan_recent_views");
            let recents = rawRecent ? JSON.parse(rawRecent) : [];
            recents = [foundProd.id, ...recents.filter((id) => id !== foundProd.id)].slice(0, 8);
            localStorage.setItem("ulavan_recent_views", JSON.stringify(recents));
          } catch (e) {}

          // Check if saved
          try {
            const rawSaved = localStorage.getItem("ulavan_saved_products");
            if (rawSaved) {
              const list = JSON.parse(rawSaved);
              setIsSaved(list.some((item) => (typeof item === "string" ? item === foundProd.id : item.id === foundProd.id)));
            }
          } catch (e) {}

          // Check if seller is unlocked
          const accessState = getLocalBuyerAccessState();
          const sellerId = foundProd.sellerId;
          setIsUnlocked(accessState.unlockedSellers.includes(sellerId));
          setQuotaRemaining(accessState.quotaRemaining ?? 10);
        } else {
          setLoadError("Agricultural commodity listing not found or no longer active.");
        }

        if (catalogRes?.success && Array.isArray(catalogRes.data)) {
          setAllProducts(catalogRes.data);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        if (isMounted) setLoadError("Unable to load commodity details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    const handleAccessChange = () => {
      const accessState = getLocalBuyerAccessState();
      setQuotaRemaining(accessState.quotaRemaining ?? 10);
      if (product?.sellerId) {
        setIsUnlocked(accessState.unlockedSellers.includes(product.sellerId));
      }
    };
    window.addEventListener("ulavan_access_changed", handleAccessChange);

    return () => {
      isMounted = false;
      window.removeEventListener("ulavan_access_changed", handleAccessChange);
    };
  }, [productId]);

  // Unlock seller action
  const handleUnlockContact = async () => {
    if (!product) return;
    setIsUnlocking(true);
    try {
      const res = await unlockSellerContact(product.id, product.sellerId, product.title);
      if (res.success) {
        setIsUnlocked(true);
        setQuotaRemaining(res.quotaRemaining);
        window.dispatchEvent(new Event("ulavan_access_changed"));
      } else {
        if (res.reason === "QUOTA_EXHAUSTED") {
          setIsSellerAccessOpen(true);
        }
      }
    } catch (err) {
      console.error("Unlock contact error:", err);
    } finally {
      setIsUnlocking(false);
    }
  };

  // Toggle Save Bookmark
  const handleToggleSave = () => {
    if (!product) return;
    try {
      const rawSaved = localStorage.getItem("ulavan_saved_products");
      let list = rawSaved ? JSON.parse(rawSaved) : [];
      const prodId = product.id;
      const alreadySaved = list.some((item) => (typeof item === "string" ? item === prodId : item.id === prodId));

      if (alreadySaved) {
        list = list.filter((item) => (typeof item === "string" ? item !== prodId : item.id !== prodId));
        setIsSaved(false);
      } else {
        list.push(product);
        setIsSaved(true);
      }

      localStorage.setItem("ulavan_saved_products", JSON.stringify(list));
      window.dispatchEvent(new Event("ulavan_saved_changed"));
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
        Loading commodity specifications and verified grower profile...
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans">
        <BuyerHeader />
        <div className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-3">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Unavailable</h2>
          <p className="text-xs text-gray-600 mb-6">{loadError || "This agricultural produce lot is no longer listed."}</p>
          <Link
            href="/marketplace"
            className="px-6 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-colors"
          >
            &larr; Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // More from this seller
  const moreFromSupplier = allProducts
    .filter((p) => p.id !== product.id && (p.sellerId === product.sellerId || p.sellerName === product.sellerName))
    .slice(0, 4);

  // Supplier directory profile
  const supplierProfile =
    SELLER_DIRECTORY.find((s) => s.id === product.sellerId || s.name === product.sellerName) || {
      id: product.sellerId,
      name: product.sellerName,
      sellerType: product.sellerType || "Verified Producer",
      district: product.originDistrict || product.district,
      verified: true,
      description: "Direct agricultural producer and registered trading entity on Ulavan Santhai.",
    };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-24 lg:pb-12">
      {/* 1. Header (Sticky 2-row header replacing sidebar) */}
      <BuyerHeader
        onSearch={(q, cat) => router.push(`/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`)}
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Product Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link href="/marketplace" className="hover:text-[#174B35] font-semibold">
            Marketplace
          </Link>
          <span>/</span>
          <Link
            href={`/marketplace?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#174B35] font-semibold"
          >
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <span>/</span>
              <span className="text-gray-600">{product.subcategory}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* 3-Column Product Details Grid (Amazon / Flipkart style B2B layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* COLUMN 1 (Left, 4 Cols): Gallery (3-4 Thumbnails + Zoom) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-4">
            <ImageGallery
              images={
                Array.isArray(product.galleryImages) && product.galleryImages.length > 0
                  ? product.galleryImages
                  : [product.thumbnail || product.image || "/images/about-farmer-harvest.jpg"]
              }
              title={product.title}
            />
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2 (Middle, 5 Cols): Specs, Badges, Price, Specs   */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-6">
            {/* Header: Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#729B59]">
                  {product.category} {product.subcategory ? `• ${product.subcategory}` : ""}
                </span>
                <StatusBadge type={product.availabilityStatus || "IN_STOCK"} size="sm" />
                {product.organicStatus?.includes("Organic") && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span>🌱 Certified Organic</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.tamilTitle && (
                <div className="text-sm font-bold text-emerald-800">
                  {product.tamilTitle}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 pt-0.5">
                <span>📍 Origin:</span>
                <strong className="text-gray-800">
                  {product.productionLocation || `${product.originDistrict}, Tamil Nadu`}
                </strong>
                <span>•</span>
                <span>Ref: <strong className="font-mono">{product.id}</strong></span>
              </div>
            </div>

            {/* Price Box / Request Price */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-[#F5F5EB] border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                  Wholesale Mandi Price
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {product.price ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-[#174B35]">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-gray-600 font-bold">
                        / {product.unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-black text-[#174B35]">
                      Request Price
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                  Min. Order Qty (MOQ)
                </span>
                <span className="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5 block">
                  {product.moq} {product.unit}
                </span>
                <span className="text-[10px] text-gray-500">
                  {product.availableStock ? `Stock: ${product.availableStock} ${product.unit}` : "Bulk lot ready"}
                </span>
              </div>
            </div>

            {/* Complete BRD Listing Specification Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 pb-1 border-b border-gray-100">
                Commodity Specifications &amp; Quality Parameters
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Variety / Cultivar</span>
                  <span className="font-bold text-gray-900">{product.variety || "Indigenous Commercial"}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Quality Grade</span>
                  <span className="font-bold text-gray-900">{product.grade || "Grade A (Premium)"}</span>
                </div>
                {product.sizeGrading && (
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Size / Mesh / Length</span>
                    <span className="font-bold text-gray-900">{product.sizeGrading}</span>
                  </div>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Origin District</span>
                  <span className="font-bold text-gray-900">{product.originDistrict || "Tamil Nadu"}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Packaging Format</span>
                  <span className="font-bold text-gray-900">{product.packaging || "Standard Commercial Bags"}</span>
                </div>
                {product.shelfLife && (
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Shelf Life</span>
                    <span className="font-bold text-gray-900">{product.shelfLife}</span>
                  </div>
                )}
                {product.processingMethod && (
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Processing Method</span>
                    <span className="font-bold text-gray-900">{product.processingMethod}</span>
                  </div>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Farming / Certification</span>
                  <span className="font-bold text-emerald-800">
                    {product.organicStatus || "Conventional Direct Farm"}
                    {product.certificationDetails ? ` (${product.certificationDetails})` : ""}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Lot Availability</span>
                  <span className="font-bold text-gray-900">
                    {product.availabilityStatus === "IN_STOCK" ? "Ready for Immediate Dispatch" : product.availabilityStatus}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Catalog Verification</span>
                  <span className="font-bold text-gray-700">{product.lastUpdated || "Verified Lot"}</span>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            {product.description && (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Lot Details &amp; Harvest Notes
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* COLUMN 3 (Right, 3 Cols): Sticky SupplierPanel          */}
          {/* ======================================================== */}
          <div className="lg:col-span-3">
            <SupplierPanel
              product={product}
              seller={supplierProfile}
              quotaRemaining={quotaRemaining}
              isUnlocked={isUnlocked}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              onEnquire={() => setIsEnquiryModalOpen(true)}
              onViewSupplier={() => setIsSupplierModalOpen(true)}
              onUnlockContact={handleUnlockContact}
              isUnlocking={isUnlocking}
            />
          </div>
        </div>

        {/* Supplier Summary Card Below the 3-Column Section */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0E3] text-[#174B35] font-black flex items-center justify-center text-xl shrink-0">
                {product.sellerName?.charAt(0) || "P"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-gray-900">
                    {product.sellerName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Verified Producer
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {product.sellerType || "Agricultural Producer"} • {product.originDistrict}, Tamil Nadu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-[#174B35] text-[#174B35] hover:bg-[#E8F0E3] text-xs font-bold transition-colors cursor-pointer"
              >
                View Full Supplier Profile
              </button>
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Send Enquiry
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {supplierProfile.description}
          </p>
        </div>

        {/* More from this Supplier */}
        {moreFromSupplier.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              More from {product.sellerName}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {moreFromSupplier.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEnquire={(item) => {
                    setProduct(item);
                    setIsEnquiryModalOpen(true);
                  }}
                  onViewSupplier={() => setIsSupplierModalOpen(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Products in this Category */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Related Commodities in {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEnquire={(item) => {
                    setProduct(item);
                    setIsEnquiryModalOpen(true);
                  }}
                  onViewSupplier={() => setIsSupplierModalOpen(true)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Action Bar with Send Enquiry */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 px-4 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] text-gray-500 font-semibold block">Wholesale Price</span>
          <span className="text-base font-black text-[#174B35]">
            {product.price ? `₹${product.price} / ${product.unit}` : "Request Price"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl border transition-colors ${
              isSaved ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-600 border-gray-300"
            }`}
            title="Save Product"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIsEnquiryModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Send Enquiry &rarr;
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Modals */}
      <SendEnquiryModal
        isOpen={isEnquiryModalOpen}
        product={product}
        onClose={() => setIsEnquiryModalOpen(false)}
      />

      <SupplierProfileModal
        isOpen={isSupplierModalOpen}
        supplier={supplierProfile}
        onClose={() => setIsSupplierModalOpen(false)}
        onOpenSendEnquiry={(p) => {
          setProduct(p);
          setIsEnquiryModalOpen(true);
        }}
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
