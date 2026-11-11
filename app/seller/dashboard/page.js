"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerMetricCard from "@/components/seller/SellerMetricCard";
import SellerBusinessCard from "@/components/seller/SellerBusinessCard";
import { getSellerDashboardData } from "@/services/sellerApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function SellerDashboardPage() {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMockActive, setIsMockActive] = useState(false);

  // Check if seller onboarding and membership payment has been completed
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const sellerDone = Boolean(
          parsed.sellerPaid ||
          parsed.sellerOnboarded ||
          (parsed.sellerData && parsed.isPaid && (parsed.role === "Seller" || parsed.activeRole === "seller"))
        );
        if (!sellerDone) {
          // If user has not completed seller onboarding, redirect to the 4-step onboarding
          router.replace("/onboarding?role=seller&step=1");
        }
      }
    } catch {
      // Safe default
    }
  }, [router]);

  // Lazy initialization of role guard check
  const [isBuyerOnly] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userRole = (parsed.role || "").toUpperCase();
        return userRole === "BUYER" && userRole !== "BOTH" && userRole !== "SELLER";
      }
    } catch {
      // Safe default
    }
    return false;
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await getSellerDashboardData();
        if (res?.status === 403 || res?.statusCode === 403) {
          router.replace("/onboarding?role=seller&step=1");
          return;
        }
        if (isMounted && res.success && res.data) {
          setDashboardData(res.data);
          setIsMockActive(Boolean(res.isMock));
        }
      } catch (err) {
        if (err?.status === 403 || err?.message?.includes("403")) {
          router.replace("/onboarding?role=seller&step=1");
          return;
        }
        console.error("Error fetching dashboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sellerInfo = dashboardData?.sellerInfo || {
    name: sessionUser?.name || "Farmer Ramesh Kumar",
    farmName: "Kongu Natural Organic Farms",
    sellerType: "Organic producer",
    district: "Coimbatore",
    location: "Anaimalai, Pollachi",
    listingStatus: "ACTIVE",
    isPaid: true,
  };

  const metrics = dashboardData?.metrics || {
    totalProducts: 8,
    activeProducts: 6,
    pendingApproval: 2,
    receivedEnquiries: 14,
  };

  const recentProducts = dashboardData?.recentProducts || [];
  const recentEnquiries = dashboardData?.recentEnquiries || [];
  const statusOverview = dashboardData?.statusOverview || {
    activeCount: 6,
    activePercentage: 75,
    pendingCount: 2,
    pendingPercentage: 25,
    outOfStockCount: 0,
    outOfStockPercentage: 0,
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Top Header */}
      <SellerHeader
        sellerName={sellerInfo.name}
        sellerType={sellerInfo.sellerType}
        farmName={sellerInfo.farmName}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Layout Container with Sidebar */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Left Sidebar Navigation */}
        <SellerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Buyer Only Route Guard Notice */}
          {isBuyerOnly && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  You are logged in with a <strong>Buyer Account</strong>. This workspace is for Agricultural Producers and Sellers.
                </span>
              </div>
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                Switch to Buyer View
              </Link>
            </div>
          )}

          {/* Development Integration Status Notice */}
          {isMockActive && (
            <div className="px-3.5 py-2 rounded-xl bg-[#E8F0E3]/70 border border-[#729B59]/30 text-[#174B35] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  <strong>Frontend Development Mode:</strong> Clean service layer active. Using verified mock data until backend seller endpoints are live.
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded border border-[#729B59]/20">
                /api/v1/seller/dashboard
              </span>
            </div>
          )}

          {/* Welcome Banner & Producer Overview */}
          <div className="bg-gradient-to-r from-[#174B35] via-[#123E2B] to-[#103A29] rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -mr-16 -mb-16 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                    {sellerInfo.sellerType || "Farmer"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Verified Producer
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome back, {sellerInfo.name}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
                  From here you can manage your listed produce, respond to direct purchase inquiries from buyers, and add new harvest batches.
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1 font-medium">
                  {sellerInfo.farmName} &bull; {sellerInfo.location}, {sellerInfo.district} District
                </p>
              </div>

              {/* Primary Action Button: Add Product */}
              <div className="shrink-0">
                <Link
                  href="/seller/products/add"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-[#174B35] font-black text-sm sm:text-base shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] border-2 border-white"
                >
                  <span className="w-6 h-6 rounded-lg bg-[#174B35] text-white flex items-center justify-center font-bold text-base leading-none">
                    +
                  </span>
                  <span>Add Product</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metric Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. My Products */}
            <SellerMetricCard
              title="My Products"
              value={metrics.totalProducts}
              subtitle="Total listed crops"
              badgeText="All Items"
              badgeType="neutral"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />

            {/* 2. Active Products */}
            <SellerMetricCard
              title="Active Products"
              value={metrics.activeProducts}
              subtitle="Available to buyers"
              badgeText="Live"
              badgeType="success"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            {/* 3. Waiting for Approval */}
            <SellerMetricCard
              title="Waiting for Approval"
              value={metrics.pendingApproval}
              subtitle="Under quality check"
              badgeText="Reviewing"
              badgeType="warning"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            {/* 4. Buyer Enquiries */}
            <SellerMetricCard
              title="Buyer Enquiries"
              value={metrics.receivedEnquiries}
              subtitle="Direct purchase leads"
              badgeText="Active Leads"
              badgeType="info"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              }
            />
          </div>

          {/* Registered Seller Business Profile (Reused from Onboarding /onboarding) */}
          <SellerBusinessCard sellerInfo={sellerInfo} showEditButton={true} />

          {/* Main Dashboard Clean 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Recently Added Products */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#174B35] tracking-tight">
                      Recently Added Products
                    </h2>
                    <p className="text-xs text-gray-500">
                      Your agricultural crops listed for commercial trading
                    </p>
                  </div>
                  <Link
                    href="/seller/products"
                    className="text-xs font-bold text-[#174B35] hover:text-[#103A29] hover:underline"
                  >
                    View All ({recentProducts.length}) &rarr;
                  </Link>
                </div>

                {/* Products List */}
                <div className="divide-y divide-gray-100 mt-2">
                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-gray-400">Loading products...</div>
                  ) : recentProducts.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-xl">
                        🌾
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        No products added yet. Click &ldquo;Add Product&rdquo; to list your first crop.
                      </p>
                    </div>
                  ) : (
                    recentProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/70 rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200">
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {product.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate">
                              {product.category} &bull; {product.variety}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              Added {product.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-black text-[#174B35]">
                            ₹{product.pricePerUnit} / {product.unit}
                          </div>
                          <div className="text-[11px] text-gray-500 font-medium">
                            Stock: {product.availableStock.toLocaleString()} {product.unit}
                          </div>
                          <div className="mt-1">
                            {product.status === "ACTIVE" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Waiting Approval
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Add Produce Action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Ready to sell another harvest?</span>
                <Link
                  href="/seller/products/add"
                  className="font-bold text-[#174B35] hover:underline inline-flex items-center gap-1"
                >
                  <span>Add New Crop</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Column 2: Recent Buyer Enquiries */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#174B35] tracking-tight">
                      Recent Buyer Enquiries
                    </h2>
                    <p className="text-xs text-gray-500">
                      Direct purchase requests from verified commercial buyers
                    </p>
                  </div>
                  <Link
                    href="/seller/enquiries"
                    className="text-xs font-bold text-[#174B35] hover:text-[#103A29] hover:underline"
                  >
                    View All ({recentEnquiries.length}) &rarr;
                  </Link>
                </div>

                <div className="space-y-3 mt-2">
                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-gray-400">Loading enquiries...</div>
                  ) : recentEnquiries.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-xl">
                        💬
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        No buyer enquiries received yet. When buyers request quotes for your crops, they will appear here.
                      </p>
                    </div>
                  ) : (
                    recentEnquiries.slice(0, 3).map((enquiry) => (
                      <div
                        key={enquiry.id}
                        className="p-3.5 rounded-2xl bg-[#F5F5EB]/60 hover:bg-[#E8F0E3]/50 border border-gray-200/80 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {enquiry.buyerName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({enquiry.buyerType})
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {enquiry.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                          <span className="font-bold text-[#174B35]">{enquiry.productRequested}</span>
                          <span>&bull;</span>
                          <span className="text-gray-900 font-bold">Qty: {enquiry.requestedQuantity}</span>
                          <span>&bull;</span>
                          <span className="text-gray-500">{enquiry.district}</span>
                        </div>

                        <p className="text-xs text-gray-600 italic bg-white/70 p-2 rounded-xl border border-gray-200/50">
                          &ldquo;{enquiry.message}&rdquo;
                        </p>

                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Direct Lead
                          </span>
                          <Link
                            href="/seller/enquiries"
                            className="text-xs font-bold text-[#174B35] hover:underline"
                          >
                            Respond to Buyer &rarr;
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Enquiries Info */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>0% commission on all direct buyer transactions</span>
                <span className="font-semibold text-emerald-700">Verified Buyers</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
