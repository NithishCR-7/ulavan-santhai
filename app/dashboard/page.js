"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { submitPayment } from "@/services/onboardingApi";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryId = searchParams.get("id");
  const queryRole = searchParams.get("role"); // 'buyer' | 'seller' | 'both'
  const queryStatus = searchParams.get("status"); // 'active' | 'unlisted'

  // User & Profile State initialized lazily
  const [user, setUser] = useState(() => {
    const defaultUser = {
      name: "Farmer Ramesh Kumar",
      email: "ramesh@ulavansanthai.in",
      mobile: "9876543210",
      role: queryRole === "buyer" ? "Buyer" : queryRole === "seller" ? "Seller" : "Both",
      buyerType: "Business",
      sellerType: "Farmer",
      status: queryStatus || "active",
      isPaid: queryStatus === "active",
      applicationId: queryId || "APP_US_982412",
      location: {
        city: "Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        pinCode: "642001",
        fullAddress: "No. 12, Thottam Road, Anaimalai",
      },
      buyerData: {
        businessName: "Kongu Farm Foods",
        gstin: "33AAAAA0000A1Z5",
      },
      sellerData: {
        cropsGrown: "Coconut, Banana, Turmeric",
        availableQuantity: "5000 kg",
      },
    };

    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("ulavan_registered_user") ||
          localStorage.getItem("ulavan_registered_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...defaultUser,
            ...parsed,
            status: queryStatus || parsed.status || defaultUser.status,
            isPaid: queryStatus === "active" ? true : (parsed.isPaid ?? defaultUser.isPaid),
            applicationId: queryId || parsed.applicationId || defaultUser.applicationId,
          };
        }
      } catch {
        // ignore
      }
    }
    return defaultUser;
  });

  const [activeView, setActiveView] = useState(() => {
    const r = (queryRole || user.role || "both").toLowerCase();
    return r === "buyer" ? "buyer" : "seller";
  });

  const [contactsLeft, setContactsLeft] = useState(10);
  const [inquirySent, setInquirySent] = useState({});

  // Payment modal state for unlisted sellers
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI");
  const [upiVpa, setUpiVpa] = useState("");
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  // Handle seller payment activation
  const handleActivateSellerListing = async () => {
    setIsProcessingPay(true);
    try {
      const res = await submitPayment({
        amount: 365,
        role: "SELLER",
        paymentMethod: payMethod,
        plan: "Seller Membership Listing Activation",
      });

      if (res.success) {
        setUser((prev) => {
          const updated = {
            ...prev,
            isPaid: true,
            status: "active",
          };
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updated));
              localStorage.setItem("ulavan_registered_user", JSON.stringify(updated));
            } catch {
              // ignore
            }
          }
          return updated;
        });
        setPaySuccessMsg("₹365 Paid Successfully! Your Seller profile is now publicly listed on the Marketplace.");
        setTimeout(() => {
          setIsPayModalOpen(false);
          setPaySuccessMsg("");
        }, 1800);
      }
    } catch {
      setPaySuccessMsg("Payment processing failed. Please retry.");
    } finally {
      setIsProcessingPay(false);
    }
  };

  const isDualRole = user.role === "Both" || user.role === "BOTH";
  const isSellerListed = user.status === "active" && user.isPaid;

  const sampleProduce = [
    { id: 1, name: "Fresh Farm Tomatoes (Country Hybrid)", farmer: "Kandasamy P.", district: "Dharmapuri", price: "₹24 / kg", minOrder: "500 kg", rating: 4.8 },
    { id: 2, name: "Grade-A Ooty Carrots (Washed)", farmer: "Murugan Selvam", district: "Nilgiris", price: "₹38 / kg", minOrder: "300 kg", rating: 4.9 },
    { id: 3, name: "Cold-Pressed Groundnut Oil (Wood Churn)", farmer: "Maragatham Agro", district: "Erode", price: "₹210 / L", minOrder: "50 Litres", rating: 5.0 },
    { id: 4, name: "Organic Wild Forest Honey", farmer: "Mani Tribal Society", district: "Salem", price: "₹390 / kg", minOrder: "20 kg", rating: 4.9 },
    { id: 5, name: "Salem Turmeric Finger (High Curcumin)", farmer: "Ranganathan G.", district: "Namakkal", price: "₹140 / kg", minOrder: "100 kg", rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5EB]/50 text-[#263329] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-xs border border-gray-200 hover:scale-105 transition-transform"
            >
              <Image
                src="/images/ulavan-santhai-emblem.jpg"
                alt="Ulavan Santhai Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#174B35] text-base sm:text-lg tracking-tight">Ulavan Santhai</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35]">
                  Common Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={`/onboarding/status?id=${encodeURIComponent(user.applicationId)}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Application Status</span>
            </Link>

            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#729B59]/40 text-xs font-semibold text-[#174B35] hover:bg-[#E8F0E3]/60 transition-colors"
            >
              <span>Marketplace Home</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-[#174B35] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div suppressHydrationWarning className="font-bold text-gray-900 leading-tight">{user.name}</div>
                <div className="text-gray-500 text-[10px]">{user.role} Account</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-[#174B35] via-[#103A29] to-[#1E6044] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 mb-2">
                <span>Application ID: {user.applicationId}</span>
                <span>•</span>
                <span>Tamil Nadu Agri Portal</span>
              </div>
              <h1 suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {user.name}!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
                Welcome to your unified Ulavan Santhai command centre. Manage your verified agricultural trade, direct farm connections, and listings with 0% middleman commission.
              </p>
            </div>

            {/* Role & Status Indicators */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
              <span className="px-3.5 py-1.5 rounded-full bg-white text-[#174B35] font-extrabold text-xs shadow-xs">
                Role: {user.role === "Both" ? "Buyer & Seller (Dual)" : user.role}
              </span>

              {user.role === "Buyer" ? (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-900 animate-pulse" />
                  Buyer Membership: Verified &amp; Active
                </span>
              ) : isSellerListed ? (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-900 animate-pulse" />
                  Marketplace Status: Active &amp; Listed
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full bg-amber-300 text-amber-950 font-extrabold text-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-900" />
                  Seller Status: Unlisted (Payment Pending)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Small Box View Switcher: Buyer Dashboard / Seller Dashboard */}
        <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xs border border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2">Dashboard Mode:</span>
            {isDualRole ? (
              <div className="inline-flex p-1 bg-[#F5F5EB] rounded-xl border border-[#729B59]/30 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveView("buyer")}
                  className={`py-2 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === "buyer"
                      ? "bg-[#174B35] text-white shadow-xs"
                      : "text-[#174B35] hover:bg-white/60"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Buyer View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView("seller")}
                  className={`py-2 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === "seller"
                      ? "bg-[#174B35] text-white shadow-xs"
                      : "text-[#174B35] hover:bg-white/60"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18c4 0 7 3 7 7 0 5-7 11-7 11S5 15 5 10c0-4 3-7 7-7z" />
                  </svg>
                  <span>Seller View</span>
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8F0E3] text-[#174B35] font-bold text-xs sm:text-sm border border-[#729B59]/30">
                {user.role === "Buyer" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Buyer Dashboard (Catalog &amp; Procurement)</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18c4 0 7 3 7 7 0 5-7 11-7 11S5 15 5 10c0-4 3-7 7-7z" />
                    </svg>
                    <span>Seller Dashboard (Inventory &amp; Inquiries)</span>
                  </>
                )}
              </div>
            )}
          </div>

          <span className="text-xs text-gray-500 pr-2">
            Active Mode: <strong className="text-[#174B35]">{activeView === "buyer" ? "Buyer Procurement" : "Seller Harvest & Listings"}</strong>
          </span>
        </div>

        {/* ========================================================================= */}
        {/* SELLER VIEW CONTENT                                                      */}
        {/* ========================================================================= */}
        {activeView === "seller" && (
          <div className="space-y-6">
            {/* SELLER PAYMENT WARNING / CALLOUT IF UNLISTED */}
            {!isSellerListed ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="text-base sm:text-lg font-bold text-amber-950">
                      Seller Profile Not Visible on Public Marketplace
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800 leading-snug max-w-2xl">
                    You chose to register without payment. Your account is verified, but your agricultural produce listings and contact details are currently hidden from prospective buyers.
                  </p>
                  <p className="text-xs font-semibold text-amber-900 pt-1">
                    Complete the ₹365 annual subscription to activate direct buyer inquiries and public marketplace visibility!
                  </p>
                </div>

                <Link
                  href="/onboarding/payment?role=seller&mode=add_second_role"
                  className="px-6 py-3 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap self-start md:self-auto inline-flex items-center gap-1.5"
                >
                  <span>Pay ₹365 &amp; Make Profile Live &rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Marketplace Listing Active</h4>
                    <p className="text-xs text-emerald-800">Your profile is discoverable by commercial and retail buyers across Tamil Nadu.</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200">
                  ₹365 Paid • 0% Commission
                </span>
              </div>
            )}

            {/* Seller Stat Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs text-gray-500 block">Seller Category</span>
                <span className="text-base sm:text-lg font-extrabold text-[#174B35] mt-1 block">
                  {user.sellerType || "Farmer"}
                </span>
                <span className="text-[10px] text-gray-400">Direct Cultivator</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs text-gray-500 block">Produce Inquiries</span>
                <span className="text-base sm:text-lg font-extrabold text-[#174B35] mt-1 block">
                  {isSellerListed ? "4 New" : "0 (Hidden)"}
                </span>
                <span className="text-[10px] text-gray-400">Past 7 days</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs text-gray-500 block">Public Profile Views</span>
                <span className="text-base sm:text-lg font-extrabold text-[#174B35] mt-1 block">
                  {isSellerListed ? "148 Views" : "Offline"}
                </span>
                <span className="text-[10px] text-gray-400">From commercial buyers</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs text-gray-500 block">Payout Account</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-700 mt-1 block">
                  Verified
                </span>
                <span className="text-[10px] text-gray-400">Bank passbook submitted</span>
              </div>
            </div>

            {/* Produce Inventory Management */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#174B35]">Your Farm Goods &amp; Harvest Supply</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Listed farm produce available for direct purchase from your farm.</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Produce listing builder: Enter crop name, harvest date, and bulk price.")}
                  className="px-4 py-2 rounded-xl bg-[#174B35] text-white font-bold text-xs hover:bg-[#103A29] transition-colors cursor-pointer"
                >
                  + Add Harvest Produce
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="py-3.5 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-gray-900 block">{user.sellerData?.cropsGrown || "Fresh Farm Harvest Produce"}</span>
                    <span className="text-gray-500 text-xs">Origin: {user.location?.village || user.location?.city}, {user.location?.district}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs">
                      Available: {user.sellerData?.availableQuantity || "Bulk Harvest"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${isSellerListed ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                      {isSellerListed ? "Live on Santhai" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BUYER VIEW CONTENT                                                       */}
        {/* ========================================================================= */}
        {activeView === "buyer" && (
          <div className="space-y-6">
            {/* Buyer Access Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#E8F0E3]/70 border border-[#729B59]/40 shadow-xs flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#174B35] text-white flex items-center justify-center font-bold text-sm">
                  🛒
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#174B35]">Verified Buyer Account: {user.buyerType}</h4>
                  <p className="text-xs text-gray-600">
                    Direct access to genuine Tamil Nadu cultivators with 0% brokerage.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#729B59]/30 text-xs font-extrabold text-[#174B35]">
                  {contactsLeft} / 10 Seller Unlocks Left
                </span>
                <span className="text-xs text-gray-500">₹365 Membership Plan</span>
              </div>
            </div>

            {/* Direct Produce Search & Catalog */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#174B35]">Direct Farm Produce Marketplace</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Contact certified producers directly for wholesale and retail procurement.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/buyer/enquiries"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5EB] border border-gray-200 text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors"
                  >
                    <span>💬 My Enquiries</span>
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Explore Products &rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleProduce.map((p) => {
                  const sent = inquirySent[p.id];
                  return (
                    <div key={p.id} className="p-4 rounded-2xl border border-gray-200 hover:border-[#729B59] transition-all bg-[#F5F5EB]/30 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-sm text-[#174B35] leading-snug">{p.name}</span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{p.price}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Farmer: <span className="font-semibold text-gray-700">{p.farmer}</span> ({p.district})</p>
                        <p className="text-[11px] text-gray-500">Min Order: {p.minOrder} • Rating: ★ {p.rating}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (sent) return;
                          if (contactsLeft > 0) {
                            setContactsLeft((c) => c - 1);
                            setInquirySent((prev) => ({ ...prev, [p.id]: true }));
                          } else {
                            alert("You have reached your 10 unlocked seller contacts limit. Top-up for ₹10 / 10 additional contacts.");
                          }
                        }}
                        disabled={sent}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          sent
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#174B35] hover:bg-[#103A29] text-white shadow-xs"
                        }`}
                      >
                        {sent ? "✓ Contact Unlocked: +91 94421 XXXXX" : "Connect with Farmer →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Profile & Registered Credentials Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
            Registered Profile &amp; Location Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block">Contact Name</span>
              <span suppressHydrationWarning className="font-bold text-gray-900 mt-0.5 block">{user.name}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Mobile Number</span>
              <span className="font-bold text-gray-900 mt-0.5 block">+91 {user.mobile}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Operating District</span>
              <span className="font-bold text-gray-900 mt-0.5 block">{user.location?.district || "Coimbatore"}</span>
            </div>
            <div>
              <span className="text-gray-400 block">PIN Code</span>
              <span className="font-bold text-gray-900 mt-0.5 block">{user.location?.pinCode || "642001"}</span>
            </div>
            {user.buyerData?.gstin && (
              <div>
                <span className="text-gray-400 block">Buyer GSTIN</span>
                <span className="font-bold text-[#174B35] mt-0.5 block">{user.buyerData.gstin}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 block">Registration Portal</span>
              <Link href="/register" className="text-[#174B35] font-bold mt-0.5 block hover:underline">
                Edit Application Details
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Activation Modal for Unlisted Sellers */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center mx-auto mb-3 font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#174B35]">Activate Seller Marketplace Listing</h3>
              <p className="text-xs text-gray-500 mt-1">
                Pay ₹365 annual subscription to make your farm profile and harvest listings visible to all buyers.
              </p>
            </div>

            {paySuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-center text-xs font-bold text-emerald-900">
                {paySuccessMsg}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPayMethod("UPI")}
                    className={`p-3 rounded-xl border text-center font-bold ${payMethod === "UPI" ? "border-[#174B35] bg-[#E8F0E3]/50 text-[#174B35]" : "border-gray-200 text-gray-600"}`}
                  >
                    UPI Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("CARD")}
                    className={`p-3 rounded-xl border text-center font-bold ${payMethod === "CARD" ? "border-[#174B35] bg-[#E8F0E3]/50 text-[#174B35]" : "border-gray-200 text-gray-600"}`}
                  >
                    Card / Net Banking
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 mb-1">UPI ID / Virtual Address</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="e.g. mobile@upi"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold px-1 text-gray-700">
                  <span>Membership Access (1 Year):</span>
                  <span className="text-[#174B35] text-sm">₹365.00</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleActivateSellerListing}
                    disabled={isProcessingPay}
                    className="px-5 py-2.5 rounded-xl bg-[#174B35] text-white font-bold text-xs hover:bg-[#103A29] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isProcessingPay ? "Processing ₹365..." : "Pay ₹365 Now →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-800 font-bold">Loading Ulavan Santhai Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
