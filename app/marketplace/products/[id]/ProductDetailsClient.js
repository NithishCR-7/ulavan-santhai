"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import HelpModal from "@/components/marketplace/HelpModal";
import {
  getMarketplaceProductById,
  getMarketplaceProducts,
} from "@/services/marketplaceApi";
import {
  getLocalBuyerAccessState,
  unlockSellerContact,
} from "@/services/sellerAccessApi";
import { createEnquiry, getBuyerEnquiries } from "@/services/enquiryApi";
import { useSessionUser } from "@/services/sessionAuth";
import { SELLER_DIRECTORY, B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

export default function ProductDetailsClient({ productId }) {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Gallery slider state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Seller access state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(7);

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sticky Enquiry Form State matching Screenshot 5
  const [enquiryForm, setEnquiryForm] = useState({
    name: "Sherlin A",
    businessName: "",
    quantity: "500 kg",
    message: "I would like to enquire about bulk availability, quality certificates, and dispatch terms.",
  });
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [recentEnquiries, setRecentEnquiries] = useState([]);

  useEffect(() => {
    if (sessionUser?.name) {
      setEnquiryForm((prev) => ({
        ...prev,
        name: sessionUser.name,
        businessName: sessionUser.businessName || prev.businessName,
      }));
    }
  }, [sessionUser]);

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
          setEnquiryForm((prev) => ({
            ...prev,
            quantity: foundProd.moqDisplay || `${foundProd.minOrderQuantity || 100} ${foundProd.moqUnit || foundProd.unit || "kg"}`,
          }));

          // Track recent views
          try {
            const rawRecent = localStorage.getItem("ulavan_recent_views");
            let recents = rawRecent ? JSON.parse(rawRecent) : [];
            recents = [foundProd.id, ...recents.filter((id) => id !== foundProd.id)].slice(0, 8);
            localStorage.setItem("ulavan_recent_views", JSON.stringify(recents));
          } catch {}

          // Check if seller is unlocked & quota
          const accessState = getLocalBuyerAccessState();
          const sellerId = foundProd.sellerId;
          setIsUnlocked(accessState.unlockedSellerIds.includes(sellerId));
          setQuotaRemaining(accessState.quotaRemaining ?? 7);
        } else {
          setLoadError("Agricultural commodity listing not found or no longer active.");
        }

        if (catalogRes?.success && Array.isArray(catalogRes.data)) {
          setAllProducts(catalogRes.data);
        }

        // Load existing enquiries
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const enqRes = await getBuyerEnquiries(buyerId);
        if (enqRes?.success && Array.isArray(enqRes.data)) {
          setRecentEnquiries(enqRes.data);
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
      setQuotaRemaining(accessState.quotaRemaining ?? 7);
      if (product?.sellerId) {
        setIsUnlocked(accessState.unlockedSellerIds.includes(product.sellerId));
      }
    };
    window.addEventListener("ulavan_access_changed", handleAccessChange);

    return () => {
      isMounted = false;
      window.removeEventListener("ulavan_access_changed", handleAccessChange);
    };
  }, [productId]);

  // Submit Enquiry Handler matching Screenshot 5
  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryError("");

    if (!enquiryForm.name.trim()) {
      setEnquiryError("Please enter your name.");
      return;
    }
    if (!enquiryForm.message.trim()) {
      setEnquiryError("Please enter your requirement message.");
      return;
    }

    setIsSubmittingEnquiry(true);

    try {
      const sellerId = product.sellerId || "APP_US_AGRIFRESH";
      const sellerName = product.sellerName || "AgriFresh Exports";

      // 1. Deduct unique seller quota if not yet unlocked
      const unlockRes = await unlockSellerContact(product.id, sellerId, product.title);
      if (!unlockRes.success && unlockRes.reason === "QUOTA_EXHAUSTED") {
        setIsSellerAccessOpen(true);
        setIsSubmittingEnquiry(false);
        setEnquiryError("You have used all 10 free seller accesses. Please top-up to contact new sellers.");
        return;
      }

      // 2. Submit enquiry
      const res = await createEnquiry({
        productId: product.id,
        productTitle: product.title,
        productCategory: product.category,
        productThumbnail: product.thumbnail || product.image,
        pricePerUnit: product.pricePerUnit || product.price,
        unit: product.unit,
        sellerId: sellerId,
        sellerName: sellerName,
        sellerDistrict: product.originDistrict || product.district,
        buyerName: enquiryForm.name,
        buyerBusinessName: enquiryForm.businessName,
        requestedQuantity: enquiryForm.quantity,
        message: enquiryForm.message,
        notes: enquiryForm.message,
      });

      if (res.success) {
        setEnquirySubmitted(true);
        setIsUnlocked(true);
        if (unlockRes.quotaRemaining !== undefined) {
          setQuotaRemaining(unlockRes.quotaRemaining);
        }
        window.dispatchEvent(new Event("ulavan_enquiry_submitted"));
        window.dispatchEvent(new Event("ulavan_access_changed"));

        // Refresh recent enquiries
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const updatedEnquiries = await getBuyerEnquiries(buyerId);
        if (updatedEnquiries?.success) {
          setRecentEnquiries(updatedEnquiries.data);
        }
      } else {
        setEnquiryError(res.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setEnquiryError("Network error submitting enquiry. Please try again.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
        Loading commodity specifications and verified grower profile...
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex flex-col font-sans">
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

  // Gallery images array
  const gallery =
    Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages
      : Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.thumbnail || product.image || "/images/about-farmer-harvest.jpg"];

  // Supplier directory profile
  const supplierProfile =
    SELLER_DIRECTORY.find((s) => s.id === product.sellerId || s.name === product.sellerName) || {
      id: product.sellerId || "APP_US_AGRIFRESH",
      name: product.sellerName || "AgriFresh Exports",
      sellerType: product.sellerType || "Agricultural Producer",
      district: product.originDistrict || "Chennai, Tamil Nadu",
      verified: true,
      description: "Direct agricultural producer and verified trading entity on Ulavan Santhai.",
    };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-16">
      {/* 1. Top Navbar matching Screenshot 5 */}
      <BuyerHeader
        onSearch={(q) => router.push(`/marketplace?search=${encodeURIComponent(q)}`)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Breadcrumb Navigation matching Screenshot 5: 🏠 > Marketplace > Pulses > Green Moong Dal */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link href="/marketplace" className="hover:text-[#174B35] text-gray-500 flex items-center gap-1">
            <span>🏠</span>
          </Link>
          <span className="text-gray-400">&gt;</span>
          <Link href="/marketplace" className="hover:text-[#174B35] font-medium text-gray-600">
            Marketplace
          </Link>
          <span className="text-gray-400">&gt;</span>
          <Link
            href={`/marketplace?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#174B35] font-medium text-gray-600"
          >
            {product.displayCategory || product.subcategory || product.category}
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 font-bold truncate">
            {product.title}
          </span>
        </nav>

        {/* 3-Section Layout matching Screenshot 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* SECTION 1 (Left, 5 Cols): Photo Slider + Desc + Specs    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Photograph */}
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-gray-200/90 shadow-2xs">
              <Image
                src={gallery[selectedImageIndex] || gallery[0]}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail Slider with < and > arrow controls (Screenshot 5 Reference) */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer shadow-2xs shrink-0"
                  title="Previous image"
                >
                  &lt;
                </button>

                <div className="flex-1 grid grid-cols-4 gap-2">
                  {gallery.slice(0, 4).map((imgUrl, idx) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#174B35] ring-2 ring-[#174B35]/20"
                            : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="90px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer shadow-2xs shrink-0"
                  title="Next image"
                >
                  &gt;
                </button>
              </div>
            )}

            {/* Product Description matching Screenshot 5 */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-2">
              <h3 className="text-sm font-extrabold text-gray-900">Product Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description ||
                  "High quality agricultural produce, cleaned and sorted for premium quality. Rich in nutrients and ideal for food processors and commercial distributors."}
              </p>
            </div>

            {/* Specifications Table (4 Columns matching Screenshot 5) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Variety</span>
                  <strong className="text-gray-900 font-bold mt-0.5 block">
                    {product.variety || "Local Native"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Grade</span>
                  <strong className="text-gray-900 font-bold mt-0.5 block">
                    {product.grade?.replace("Grade: ", "") || "Premium"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Packaging</span>
                  <strong className="text-gray-900 font-bold mt-0.5 block">
                    {product.packaging || "25 kg / 50 kg"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Shelf Life</span>
                  <strong className="text-gray-900 font-bold mt-0.5 block">
                    {product.shelfLife || "12 Months"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2 (Middle, 4 Cols): Title, Supplier Card, Specs  */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-5">
            {/* Title & Category Chip */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {product.title}
              </h1>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                {product.displayCategory || product.subcategory || product.category}
              </div>
            </div>

            {/* Supplier Card matching Screenshot 5 */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#174B35] font-black flex items-center justify-center text-lg shrink-0">
                    🌾
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-gray-900">
                        {supplierProfile.name}
                      </h4>
                      <span className="text-emerald-700 font-bold text-xs">✓ Verified Seller</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {supplierProfile.location || `${supplierProfile.district}, Tamil Nadu`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="text-xs font-bold text-[#174B35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Seller Profile</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* 4 Key Spec Attributes (2x2 Grid matching Screenshot 5) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>📍</span>
                  <span>Origin</span>
                </div>
                <strong className="text-xs sm:text-sm font-bold text-gray-900 mt-1 block">
                  {product.originDistrict || "Karnataka, India"}
                </strong>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>★</span>
                  <span>Grade</span>
                </div>
                <strong className="text-xs sm:text-sm font-bold text-gray-900 mt-1 block">
                  {product.grade?.replace("Grade: ", "") || "Premium"}
                </strong>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>🛒</span>
                  <span>Min. Order</span>
                </div>
                <strong className="text-xs sm:text-sm font-bold text-gray-900 mt-1 block">
                  {product.moqDisplay?.replace("MOQ: ", "") || `${product.minOrderQuantity || 100} ${product.unit || "kg"}`}
                </strong>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>●</span>
                  <span>Availability</span>
                </div>
                <strong className="text-xs sm:text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>{product.availabilityStatus === "IN_STOCK" ? "In Stock" : product.availabilityStatus}</span>
                </strong>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3 (Right, 3 Cols): Sticky Enquiry Panel / Sent   */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 sticky top-20">
            {!enquirySubmitted ? (
              /* State A: Sticky Form "Enquire with Seller" matching Screenshot 5 */
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md overflow-hidden">
                {/* Forest Green Header */}
                <div className="bg-[#174B35] text-white p-4">
                  <h3 className="text-sm font-bold tracking-wide">Enquire with Seller</h3>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmitEnquiry} className="p-4 space-y-3.5 text-xs">
                  {enquiryError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-[11px]">
                      {enquiryError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 block">Your Name *</label>
                    <input
                      type="text"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 block">Business Name (Optional)</label>
                    <input
                      type="text"
                      value={enquiryForm.businessName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, businessName: e.target.value })}
                      placeholder="Enter business name"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 block">Required Quantity</label>
                    <input
                      type="text"
                      value={enquiryForm.quantity}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: e.target.value })}
                      placeholder="e.g. 1 Ton"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 block">Your Requirement / Message *</label>
                    <textarea
                      rows={4}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="Tell the seller about your requirement..."
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#174B35] outline-none text-gray-800 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="w-full py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingEnquiry ? "Submitting..." : "Submit Enquiry"}
                  </button>
                </form>
              </div>
            ) : (
              /* State B: Success Card + "My Enquiries" Preview matching Screenshot 5 */
              <div className="space-y-4 animate-in fade-in">
                {/* Green Checkmark Confirmation Card */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Enquiry Submitted!</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      The seller will contact you shortly.
                    </p>
                  </div>
                  <Link
                    href="/buyer/enquiries"
                    className="block w-full py-2 px-4 rounded-xl border border-gray-300 hover:border-[#174B35] text-xs font-bold text-gray-700 hover:text-[#174B35] transition-colors"
                  >
                    View My Enquiries
                  </Link>
                </div>

                {/* My Enquiries Preview Widget matching Screenshot 5 */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-gray-900">My Enquiries</span>
                    <Link href="/buyer/enquiries" className="text-xs font-bold text-[#174B35] hover:underline">
                      View All &rarr;
                    </Link>
                  </div>

                  {/* Most recent item card */}
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-white shrink-0 border border-gray-200">
                        <Image
                          src={product.thumbnail || product.image || "/images/about-farmer-harvest.jpg"}
                          alt={product.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-gray-900 block truncate">{product.title}</span>
                        <span className="text-[10px] text-gray-500">Nov 10, 2026</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      Sent
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SupplierProfileModal
        isOpen={isSupplierModalOpen}
        supplier={supplierProfile}
        onClose={() => setIsSupplierModalOpen(false)}
        onOpenSendEnquiry={() => {
          setIsSupplierModalOpen(false);
        }}
      />

      <SellerAccessModal
        isOpen={isSellerAccessOpen}
        onClose={() => setIsSellerAccessOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}