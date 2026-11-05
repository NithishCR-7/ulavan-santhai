"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductPreviewModal from "@/components/seller/ProductPreviewModal";
import ProductDeactivateModal from "@/components/seller/ProductDeactivateModal";
import { getSellerProducts, toggleProductStatus } from "@/services/productApi";
import { getLocalSellerProfile } from "@/services/sellerApi";

const PRODUCT_CATEGORIES = [
  "All Categories",
  "Vegetables & Tubers",
  "Fruits",
  "Grains & Millets",
  "Spices & Condiments",
  "Pulses & Legumes",
  "Oils & Oilseeds",
  "Plantation & Commercial Crops",
  "Organic & Natural Produce",
  "Processed & Value Added",
];

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters & Sorting
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Modals state
  const [viewProduct, setViewProduct] = useState(null);
  const [deactivateProduct, setDeactivateProduct] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const [sellerProfile] = useState(() => getLocalSellerProfile());

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const res = await getSellerProducts();
        if (isMounted && res.success && res.data) {
          setProducts(res.data);
        } else if (isMounted) {
          setLoadError("Could not load products. Please try again.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load seller products:", err);
          setLoadError("Network error. Could not connect to product service.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await getSellerProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setLoadError("Could not load products. Please try again.");
      }
    } catch {
      setLoadError("Network error. Could not connect to product service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Deactivate / Reactivate
  const handleConfirmStatusToggle = async () => {
    if (!deactivateProduct) return;

    setIsActionLoading(true);
    const targetStatus = deactivateProduct.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";

    try {
      const res = await toggleProductStatus(deactivateProduct.id, targetStatus);
      if (res.success) {
        // Update local list
        setProducts((prev) =>
          prev.map((p) => (p.id === deactivateProduct.id ? { ...p, status: targetStatus } : p))
        );

        // Also update view product if open
        if (viewProduct && viewProduct.id === deactivateProduct.id) {
          setViewProduct({ ...viewProduct, status: targetStatus });
        }

        setActionNotice({
          type: "SUCCESS",
          message:
            targetStatus === "INACTIVE"
              ? `"${deactivateProduct.title}" has been deactivated and hidden from commercial buyers.`
              : `"${deactivateProduct.title}" has been reactivated and is now visible on the marketplace.`,
        });

        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
    } finally {
      setIsActionLoading(false);
      setDeactivateProduct(null);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      // Status Match
      let matchesStatus = true;
      if (selectedStatus === "ACTIVE") matchesStatus = p.status === "ACTIVE";
      else if (selectedStatus === "PENDING")
        matchesStatus = p.status === "PENDING" || p.status === "WAITING_APPROVAL";
      else if (selectedStatus === "DRAFT") matchesStatus = p.status === "DRAFT";
      else if (selectedStatus === "INACTIVE") matchesStatus = p.status === "INACTIVE";
      else if (selectedStatus === "REJECTED") matchesStatus = p.status === "REJECTED";

      // Category Match
      const matchesCategory =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      // Search Query Match (Title, variety, category, origin)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.variety?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.originDistrict?.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") return (b.id > a.id ? 1 : -1);
      if (sortBy === "OLDEST") return (a.id > b.id ? 1 : -1);
      if (sortBy === "PRICE_LOW") return (a.pricePerUnit || 0) - (b.pricePerUnit || 0);
      if (sortBy === "PRICE_HIGH") return (b.pricePerUnit || 0) - (a.pricePerUnit || 0);
      if (sortBy === "STOCK_HIGH") return (b.availableStock || 0) - (a.availableStock || 0);
      return 0;
    });

  // Dynamic Product Summary Counts from actual data
  const counts = {
    total: products.length,
    published: products.filter((p) => p.status === "ACTIVE").length,
    pending: products.filter((p) => p.status === "PENDING" || p.status === "WAITING_APPROVAL").length,
    drafts: products.filter((p) => p.status === "DRAFT").length,
    inactive: products.filter((p) => p.status === "INACTIVE").length,
  };

  const isFiltered =
    selectedStatus !== "ALL" || selectedCategory !== "All Categories" || searchQuery !== "";

  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSelectedCategory("All Categories");
    setSearchQuery("");
    setSortBy("NEWEST");
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Header */}
      <SellerHeader
        sellerName={sellerProfile?.name}
        sellerType={sellerProfile?.sellerType}
        farmName={sellerProfile?.sellerData?.farmerFarmName || sellerProfile?.farmName}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Sidebar */}
        <SellerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Top Bar with Add Product CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
                <span>Product Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight">
                My Products
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your listed products in one place.
              </p>
            </div>

            <Link
              href="/seller/products/add"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span className="text-lg leading-none font-bold">+</span>
              <span>Add New Product</span>
            </Link>
          </div>

          {/* Action Success Toast Banner */}
          {actionNotice && (
            <div className="p-4 rounded-2xl bg-[#E8F0E3] border border-[#729B59]/40 text-[#174B35] text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>{actionNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionNotice(null)}
                className="text-emerald-800 hover:text-emerald-950 font-bold ml-3"
              >
                &times;
              </button>
            </div>
          )}

          {/* 3. Product Summary Cards (Dynamic from actual product records) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Products */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 block mb-1">Total Products</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-[#174B35]">{counts.total}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">All Items</span>
              </div>
            </div>

            {/* 2. Published Products */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 block mb-1">Published Products</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">{counts.published}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Live</span>
              </div>
            </div>

            {/* 3. Pending Review */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 block mb-1">Pending Review</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">{counts.pending}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Reviewing</span>
              </div>
            </div>

            {/* 4. Drafts */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 block mb-1">Drafts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-gray-700">{counts.drafts}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Saved</span>
              </div>
            </div>
          </div>

          {/* 6. Search & Filters Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs space-y-4">
            {/* Top row: Status Filter Tabs */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "ALL"
                      ? "bg-[#174B35] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ACTIVE")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "ACTIVE"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Published ({counts.published})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("PENDING")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "PENDING"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Pending Review ({counts.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("DRAFT")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "DRAFT"
                      ? "bg-gray-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Drafts ({counts.drafts})
                </button>
                {counts.inactive > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("INACTIVE")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedStatus === "INACTIVE"
                        ? "bg-gray-700 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Inactive ({counts.inactive})
                  </button>
                )}
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#174B35] hover:underline whitespace-nowrap cursor-pointer shrink-0"
                >
                  Reset Filters &times;
                </button>
              )}
            </div>

            {/* Bottom row: Search Box, Category Filter, and Sort Control */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              {/* Search Box (6 cols) */}
              <div className="sm:col-span-6 relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by crop name, variety, district..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>

              {/* Category Dropdown (3 cols) */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown (3 cols) */}
              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                >
                  <option value="NEWEST">Sort: Newest Added</option>
                  <option value="OLDEST">Sort: Oldest Added</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="STOCK_HIGH">Stock: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {loadError && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg bg-red-800 text-white font-bold text-xs hover:bg-red-900"
              >
                Retry
              </button>
            </div>
          )}

          {/* 4. Product List Display */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
              <div className="animate-spin w-8 h-8 border-4 border-[#174B35] border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            /* 10. Initial Empty State: Seller has not added any products */
            <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-200/90 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center mx-auto text-3xl shadow-xs">
                🌾
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                You haven&apos;t added any products yet.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Start listing your farm produce or agricultural commodities so verified commercial buyers can discover your harvest and send direct purchase enquiries.
              </p>
              <div className="pt-2">
                <Link
                  href="/seller/products/add"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-base font-bold">+</span>
                  <span>Add Your First Product</span>
                </Link>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* 10. Filtered Empty State: No results match search/filter */
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/90 shadow-2xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-black text-gray-900">No products match your filters</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                No crops were found under the current search and filter selections.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Responsive Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isInactive = product.status === "INACTIVE";
                const isPending =
                  product.status === "PENDING" || product.status === "WAITING_APPROVAL";
                const isDraft = product.status === "DRAFT";
                const isRejected = product.status === "REJECTED";
                const isActive = product.status === "ACTIVE";

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl p-5 border shadow-2xs transition-all flex flex-col justify-between space-y-4 group ${
                      isInactive
                        ? "border-gray-200 bg-gray-50/50 opacity-85"
                        : "border-gray-200/90 hover:border-[#729B59]/60 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Thumbnail & Status Tag */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                        <Image
                          src={product.thumbnail || "/images/about-farmer-harvest.jpg"}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 350px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              Published
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                              Pending Review
                            </span>
                          )}
                          {isDraft && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-700/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              Draft
                            </span>
                          )}
                          {isInactive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              Inactive (Hidden)
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              Needs Revision
                            </span>
                          )}
                        </div>

                        {/* Category Tag */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {product.category}
                        </div>
                      </div>

                      {/* Title & Variety */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span>{product.variety || "Standard Variety"}</span>
                          <span>{product.grade || "Grade A"}</span>
                        </div>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-[#174B35] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </div>

                      {/* Price and Stock Stats */}
                      <div className="mt-3 p-3 rounded-2xl bg-[#F5F5EB] border border-gray-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">Price</span>
                          <span className="text-base font-black text-[#174B35]">
                            ₹{Number(product.pricePerUnit || 0).toLocaleString("en-IN")}
                            <span className="text-xs font-semibold text-gray-600"> / {product.unit}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">Available Stock</span>
                          <span className="text-xs font-bold text-gray-900">
                            {Number(product.availableStock || 0).toLocaleString("en-IN")} {product.unit}
                          </span>
                        </div>
                      </div>

                      {/* Origin & Metadata */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>MOQ: {product.minOrderQuantity} {product.moqUnit || product.unit}</span>
                        <span>{product.originDistrict || "Coimbatore"}</span>
                      </div>

                      {/* Rejection Notice Banner */}
                      {isRejected && product.rejectionReason && (
                        <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] leading-tight">
                          <strong>Admin Feedback:</strong> {product.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Actions: View, Edit, Deactivate/Reactivate */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setViewProduct(product)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-[#174B35] hover:bg-[#E8F0E3]/60 text-xs font-bold transition-colors cursor-pointer"
                      >
                        View
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <Link
                          href={`/seller/products/add?edit=${product.id}`}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                        >
                          Edit
                        </Link>

                        {/* Deactivate / Reactivate Action */}
                        <button
                          type="button"
                          onClick={() => setDeactivateProduct(product)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isInactive
                              ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          }`}
                        >
                          {isInactive ? "Reactivate" : "Deactivate"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 7. View Product Details Modal */}
      <ProductPreviewModal
        isOpen={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
        product={viewProduct}
        mode="view"
        onTriggerStatusToggle={(prod) => {
          setViewProduct(null);
          setDeactivateProduct(prod);
        }}
      />

      {/* 9. Deactivate / Reactivate Confirmation Modal */}
      <ProductDeactivateModal
        isOpen={Boolean(deactivateProduct)}
        onClose={() => setDeactivateProduct(null)}
        product={deactivateProduct}
        targetStatus={deactivateProduct?.status === "INACTIVE" ? "ACTIVE" : "INACTIVE"}
        onConfirm={handleConfirmStatusToggle}
        isActionLoading={isActionLoading}
      />
    </div>
  );
}
