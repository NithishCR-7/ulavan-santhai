"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import SendEnquiryModal from "@/components/enquiry/SendEnquiryModal";
import {
  getSellerForProduct,
  unlockSellerContact,
  topUpBuyerQuota,
  getBuyerAccessEntitlement,
} from "@/services/sellerAccessApi";

export default function ProductDetailsClient({ productId }) {
  // Mock marketplace catalog matching verified Tamil Nadu producers
  const catalogProducts = [
    {
      id: "prod_101",
      title: "Salem High-Curcumin Turmeric Finger",
      category: "Spices & Condiments",
      variety: "Salem Local (Curcumin 4.8%)",
      grade: "Grade A (Premium)",
      pricePerUnit: 140,
      unit: "kg",
      availableStock: 2500,
      minOrderQuantity: 100,
      moqUnit: "kg",
      harvestDate: "2026-10-15",
      shelfLife: "18 Months",
      packaging: "50kg Jute Gunny Bags",
      processing: "Sun-dried & Double Polished",
      farmingMethod: "Certified Organic (Zero Chemical)",
      certifications: ["NPOP Organic", "FSSAI Verified"],
      originVillage: "Anaimalai",
      originDistrict: "Salem",
      originState: "Tamil Nadu",
      sellerId: "APP_US_982412",
      sellerName: "Kongu Natural Organic Farms",
      sellerType: "Organic Producer",
      images: [
        "/images/about-farmer-harvest.jpg",
        "/images/hero-turmeric-harvest.png",
      ],
      description:
        "Direct harvest lot of traditional Salem high-curcumin turmeric fingers. Grown without chemical pesticides, cured under direct sun on clean concrete drying beds, and double-polished for export-grade presentation. Ideal for extraction, pharmaceutical use, and premium masala blending.",
    },
    {
      id: "prod_102",
      title: "Grade-A Ooty Carrots (Fresh Washed)",
      category: "Vegetables & Tubers",
      variety: "Nantes European Cross",
      grade: "Grade A (Export Quality)",
      pricePerUnit: 38,
      unit: "kg",
      availableStock: 1200,
      minOrderQuantity: 300,
      moqUnit: "kg",
      harvestDate: "2026-11-04",
      shelfLife: "14 Days in cold storage",
      packaging: "25kg Ventilated Plastic Crates",
      processing: "Hydro-cooled & Machine Washed",
      farmingMethod: "Hill Valley Terrace Cultivation",
      certifications: ["Horticulture Dept Verified"],
      originVillage: "Ketti Valley",
      originDistrict: "Nilgiris",
      originState: "Tamil Nadu",
      sellerId: "APP_US_441209",
      sellerName: "Nilgiris Horticulture Farmer Society",
      sellerType: "Agricultural Producer (FPO)",
      images: [
        "/images/about-farmer-harvest.jpg",
      ],
      description:
        "High-altitude crisp Ooty carrots harvested at dawn, hydro-washed with pure mountain spring water, and crated same day. High brix sweetness and vibrant orange color. Available for direct bulk supply to central vegetable markets and supermarket chains.",
    },
    {
      id: "prod_103",
      title: "Cold-Pressed Groundnut Oil (Wood Churn)",
      category: "Oils & Oilseeds",
      variety: "Marachekku (Cold Pressed)",
      grade: "Grade A (Premium)",
      pricePerUnit: 210,
      unit: "litre",
      availableStock: 450,
      minOrderQuantity: 50,
      moqUnit: "litre",
      harvestDate: "2026-10-28",
      shelfLife: "9 Months",
      packaging: "15-Litre Food Grade Tin / 200L Drum",
      processing: "Slow Wooden Vaagai Chekku Extraction (< 42°C)",
      farmingMethod: "Natural Agro Processing",
      certifications: ["FSSAI License: 10020042000789"],
      originVillage: "Perundurai",
      originDistrict: "Erode",
      originState: "Tamil Nadu",
      sellerId: "APP_US_771822",
      sellerName: "Kongu Traditional Chekku Producers",
      sellerType: "Ingredient Producer",
      images: [
        "/images/about-farmer-harvest.jpg",
      ],
      description:
        "Traditional cold-pressed groundnut oil extracted in Vaagai wood press from hand-picked native groundnuts. Unrefined, unbleached, with natural aroma and zero chemical preservatives. Lab tested free of argemone and aflatoxin.",
    },
    {
      id: "prod_105",
      title: "Organic Wild Forest Honey",
      category: "Organic & Natural Produce",
      variety: "Javadi Hills Raw Wild Honey",
      grade: "Grade A (Export Quality)",
      pricePerUnit: 390,
      unit: "kg",
      availableStock: 80,
      minOrderQuantity: 20,
      moqUnit: "kg",
      harvestDate: "2026-09-15",
      shelfLife: "24 Months",
      packaging: "25kg Food-grade HDPE Barrels",
      processing: "Raw Unheated & Cloth Filtered",
      farmingMethod: "Tribal Cooperative Wild Harvest",
      certifications: ["Tribal Cooperative Certified", "FSSAI Verified"],
      originVillage: "Jamunamarathur",
      originDistrict: "Tiruvannamalai",
      originState: "Tamil Nadu",
      sellerId: "APP_US_312984",
      sellerName: "Javadi Hills Tribal Honey Society",
      sellerType: "Farmer / Producer Group",
      images: [
        "/images/about-farmer-harvest.jpg",
      ],
      description:
        "Raw unprocessed wild multi-flora honey sustainably gathered by indigenous tribal honey hunters in Javadi Hills. Unpasteurized and unfiltered except for double cotton cloth filtration. Rich pollen content with natural medicinal properties.",
    },
    {
      id: "prod_106",
      title: "BPT 5204 Deluxe Ponni Paddy (Aged Grains)",
      category: "Grains & Millets",
      variety: "BPT 5204 Andhra / Ponni Cross",
      grade: "Grade A (Premium)",
      pricePerUnit: 24,
      unit: "kg",
      availableStock: 15000,
      minOrderQuantity: 1000,
      moqUnit: "kg",
      harvestDate: "2026-10-01",
      shelfLife: "12 Months",
      packaging: "75kg Moisture Barrier Gunny Bags",
      processing: "Mandi Standard Cleaned & Destoned",
      farmingMethod: "Cauvery Delta Canal Irrigated",
      certifications: ["Uzhavar Sandhai Registered"],
      originVillage: "Kumbakonam",
      originDistrict: "Thanjavur",
      originState: "Tamil Nadu",
      sellerId: "APP_US_619022",
      sellerName: "Cauvery Delta Uzhavar Producer Company",
      sellerType: "Agricultural Producer (FPO)",
      images: [
        "/images/about-farmer-harvest.jpg",
      ],
      description:
        "Aged 1-year cured Deluxe Ponni raw paddy harvested in the fertile Cauvery delta belt. High milling recovery percentage (> 68%), low breakage, and superior cooking aroma. Minimum moisture content under 12%. Direct delivery available by truckload.",
    },
    {
      id: "prod_107",
      title: "Desi Country Small Red Onions (Shallots)",
      category: "Vegetables & Tubers",
      variety: "Co-4 Small Onion",
      grade: "Grade A (Export Quality)",
      pricePerUnit: 48,
      unit: "kg",
      availableStock: 3500,
      minOrderQuantity: 200,
      moqUnit: "kg",
      harvestDate: "2026-11-02",
      shelfLife: "45 Days in ventilated storage",
      packaging: "10kg & 25kg Net Mesh Bags",
      processing: "Field Cured & Root Trimmed",
      farmingMethod: "Traditional Drip Irrigated",
      certifications: ["Mandi Quality Inspected"],
      originVillage: "Oddanchatram",
      originDistrict: "Dindigul",
      originState: "Tamil Nadu",
      sellerId: "APP_US_883190",
      sellerName: "Dindigul Traditional Agri Farmers",
      sellerType: "Farmer",
      images: [
        "/images/about-farmer-harvest.jpg",
      ],
      description:
        "Original Tamil Nadu country sambar shallots from Oddanchatram belt. Uniform medium size, deep pink outer peel, punchy pungency, and exceptional shelf life. Pre-sorted and packed in ventilated mesh bags.",
    },
  ];

  const product = catalogProducts.find((p) => String(p.id) === String(productId));

  // Active Image Gallery Selection
  const [activeImage, setActiveImage] = useState(
    product?.images?.[0] || "/images/about-farmer-harvest.jpg"
  );

  // Seller Details & Access State initialized lazily
  const [seller, setSeller] = useState(() => {
    return product ? getSellerForProduct(product.sellerId) : null;
  });
  const [accessEntitlement, setAccessEntitlement] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Send Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySentBadge, setEnquirySentBadge] = useState(false);

  // Load Buyer access state
  useEffect(() => {
    let isMounted = true;
    getBuyerAccessEntitlement().then((res) => {
      if (isMounted && res.data) {
        setAccessEntitlement(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Unlock Seller Contact (BRD Rules: 10 free unlocks, repeat visit = 0 deduction)
  const handleUnlockContact = async () => {
    if (!product || !seller) return;
    setIsUnlocking(true);
    setUnlockMessage("");

    try {
      const res = await unlockSellerContact(product.id, seller.sellerId, product.title);

      if (res.success && res.seller) {
        setSeller(res.seller);
        setAccessEntitlement((prev) => ({
          ...prev,
          quotaRemaining: res.quotaRemaining,
          unlockedSellerIds: [...(prev?.unlockedSellerIds || []), seller.sellerId],
        }));

        if (res.deducted) {
          setUnlockMessage(
            `✓ Contact unlocked! 1 view deducted (${res.quotaRemaining} views remaining).`
          );
        } else {
          setUnlockMessage(
            `✓ Unlocked! You previously unlocked this seller (0 views deducted).`
          );
        }
      } else {
        setUnlockMessage(res.error || "Unable to unlock seller contact.");
      }
    } catch (err) {
      console.error("Error unlocking seller contact:", err);
      setUnlockMessage("Network error unlocking seller. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  // Handle Top-Up (+10 views for ₹10)
  const handleTopUp = async () => {
    setIsTopUpLoading(true);
    try {
      const res = await topUpBuyerQuota();
      if (res.success) {
        setAccessEntitlement((prev) => ({
          ...prev,
          quotaRemaining: res.quotaRemaining,
        }));
        setUnlockMessage("✓ Top-up successful! +10 seller contact unlocks added to your account.");
      }
    } catch (err) {
      console.error("Top-up failed:", err);
    } finally {
      setIsTopUpLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans">
        <MarketplaceHeader />
        <main className="max-w-4xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-black">
            !
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Produce Listing Not Found
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The requested agricultural lot ID (<code>{productId}</code>) may have been sold out, deactivated, or removed by the seller.
          </p>
          <div className="pt-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs"
            >
              &larr; Return to Marketplace Lots
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const quota = accessEntitlement?.quotaRemaining ?? 10;
  const isUnlocked = Boolean(seller?.isUnlocked);

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      <MarketplaceHeader />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 space-y-8">
        {/* Navigation Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#174B35] hover:text-[#103A29] hover:border-[#174B35]/40 transition-colors shadow-2xs font-bold"
            >
              <span>&larr;</span>
              <span>Back to Marketplace</span>
            </Link>
            <span>/</span>
            <span className="text-gray-400">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/enquiries"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#174B35] text-xs font-bold shadow-2xs transition-colors"
            >
              <span>💬</span>
              <span>My Enquiries</span>
            </Link>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Verified Producer Lot
            </span>
          </div>
        </div>

        {/* Top Product & Seller Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-gray-200/90 shadow-2xs">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#174B35] text-xs font-black shadow-xs">
                  {product.grade || "Grade A"}
                </span>
                {product.certifications?.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-xs"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery Switcher */}
            {product.images?.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden relative border-2 transition-all cursor-pointer ${
                      activeImage === img
                        ? "border-[#174B35] shadow-xs scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready for Dispatch
                </span>
              </div>

              {/* Title & Variety */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {product.variety && (
                <p className="text-sm font-semibold text-gray-600">
                  Variety / Cultivar: <span className="text-gray-900 font-extrabold">{product.variety}</span>
                </p>
              )}

              {/* Wholesale Pricing Display */}
              <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    Direct Farm Wholesale Rate
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#174B35]">
                      ₹{Number(product.pricePerUnit).toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-600">
                      / {product.unit}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#729B59] font-bold">
                    0% Mandi Commission &bull; Direct Producer Price
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    Available Stock
                  </span>
                  <span className="text-lg sm:text-xl font-black text-gray-900">
                    {Number(product.availableStock).toLocaleString("en-IN")} {product.unit}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    MOQ: {Number(product.minOrderQuantity).toLocaleString("en-IN")}{" "}
                    {product.moqUnit || product.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Produce Description &amp; Specifications
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Produce Attributes Grid */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {product.farmingMethod && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Farming Method</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{product.farmingMethod}</span>
                  </div>
                )}
                {product.harvestDate && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Harvest Date</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{product.harvestDate}</span>
                  </div>
                )}
                {product.packaging && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Packaging Type</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{product.packaging}</span>
                  </div>
                )}
                {product.processing && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Processing / Curing</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{product.processing}</span>
                  </div>
                )}
                {product.shelfLife && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Shelf Life</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{product.shelfLife}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block text-[11px]">Harvest Location</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">
                    {product.originVillage ? `${product.originVillage}, ` : ""}{product.originDistrict}, {product.originState}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Primary Actions: Send Enquiry + Unlock Contact */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(true)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>Send Purchase Enquiry</span>
                <span>&rarr;</span>
              </button>

              {enquirySentBadge && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <span>✓</span>
                  <span>Enquiry Dispatched</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller Access & Contact Card (Task 6 & Task 7 Integration) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Verified Supplier Details</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Seller &amp; Farm Access
              </h2>
              <p className="text-xs text-gray-500">
                Direct producer contacts are protected under UlavanSanthai fair-trade buyer rules.
              </p>
            </div>

            {/* Quota Counter Badge */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#F5F5EB] border border-gray-200 text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Buyer Contact Access
                </span>
                <span className="text-sm font-black text-[#174B35]">
                  {quota} of 10 Free Unlocks Remaining
                </span>
              </div>
            </div>
          </div>

          {/* Unlock Message Notification Banner */}
          {unlockMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
              {unlockMessage}
            </div>
          )}

          {/* Seller Information Display: Locked vs. Unlocked */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Entity Overview */}
            <div className="p-5 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80 space-y-3">
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                  Business / Producer Entity
                </span>
                <span className="text-base font-black text-gray-900 mt-1 block">
                  {seller?.businessName || product.sellerName}
                </span>
                <span className="text-xs font-bold text-[#729B59]">
                  {seller?.sellerType || product.sellerType || "Farmer"}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered District:</span>
                  <span className="font-bold text-gray-800">{seller?.district || product.originDistrict}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">State:</span>
                  <span className="font-bold text-gray-800">Tamil Nadu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">KYC Status:</span>
                  <span className="font-bold text-emerald-700">✓ Identity Verified</span>
                </div>
              </div>
            </div>

            {/* Direct Phone & Email Access */}
            <div className="p-5 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80 space-y-3">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                Direct Contact Person
              </span>

              {isUnlocked ? (
                /* UNLOCKED: Full Permitted Direct Contact Details */
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Contact Person</span>
                    <span className="font-black text-gray-900 text-sm">{seller?.contactPerson}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Phone / WhatsApp</span>
                    <a
                      href={`tel:${seller?.phone?.replace(/\s/g, "")}`}
                      className="font-black text-[#174B35] hover:underline text-sm flex items-center gap-1.5"
                    >
                      <span>📞</span>
                      <span>{seller?.phone}</span>
                    </a>
                  </div>

                  {seller?.email && (
                    <div>
                      <span className="text-gray-400 block text-[11px]">Email Address</span>
                      <a
                        href={`mailto:${seller?.email}`}
                        className="font-bold text-gray-800 hover:text-[#174B35] underline"
                      >
                        {seller?.email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* LOCKED: Masked Contact & Unlock Action */
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Direct Mobile</span>
                    <span className="font-mono font-bold text-gray-500 text-sm">
                      {seller?.phone || "+91 94432 •••••"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Email</span>
                    <span className="font-mono text-gray-500">
                      {seller?.email || "producer•••••@ulavansanthai.in"}
                    </span>
                  </div>

                  <div className="pt-1">
                    {quota > 0 ? (
                      <button
                        type="button"
                        onClick={handleUnlockContact}
                        disabled={isUnlocking}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isUnlocking ? "Unlocking Contact..." : "🔓 Unlock Seller Details (1 View)"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleTopUp}
                        disabled={isTopUpLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        {isTopUpLoading ? "Processing..." : "Top-up ₹10 for 10 Contact Unlocks"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Farm Facility Address & Licenses */}
            <div className="p-5 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80 space-y-3">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                Facility &amp; Business Licenses
              </span>

              {isUnlocked ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Facility / Farm Address</span>
                    <span className="font-medium text-gray-800 leading-snug block">
                      {seller?.address}, {seller?.district}, PIN: {seller?.pinCode || "642001"}
                    </span>
                  </div>

                  {seller?.gstin && (
                    <div className="pt-1 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px]">GSTIN</span>
                      <span className="font-mono font-bold text-gray-900">{seller.gstin}</span>
                    </div>
                  )}

                  {seller?.fssaiNumber && (
                    <div>
                      <span className="text-gray-400 block text-[11px]">FSSAI Registration</span>
                      <span className="font-mono font-bold text-gray-900">{seller.fssaiNumber}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs text-gray-500">
                  <p className="leading-relaxed">
                    Physical farm address, dispatch yard pin-code, GSTIN, and FSSAI license numbers will be revealed once contact access is unlocked.
                  </p>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-600">
                    ℹ️ <em>Repeat visits to an unlocked producer consume 0 view deductions.</em>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Send Enquiry Modal */}
      <SendEnquiryModal
        product={product}
        seller={seller}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        onEnquirySuccess={(enq) => {
          setEnquirySentBadge(true);
        }}
      />
    </div>
  );
}
