"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductPreviewModal from "@/components/seller/ProductPreviewModal";
import { getSellerProducts } from "@/services/productApi";
import { getLocalSellerProfile } from "@/services/sellerApi";

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);

  const [sellerProfile] = useState(() => getLocalSellerProfile());

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getSellerProducts();
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to load seller products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products by tab and search
  const filteredProducts = products.filter((p) => {
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && p.status === "ACTIVE") ||
      (selectedStatus === "PENDING" && (p.status === "PENDING" || p.status === "WAITING_APPROVAL")) ||
      (selectedStatus === "DRAFT" && p.status === "DRAFT");

    const matchesSearch =
      searchQuery === "" ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variety?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    pending: products.filter((p) => p.status === "PENDING" || p.status === "WAITING_APPROVAL").length,
    draft: products.filter((p) => p.status === "DRAFT").length,
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
                My Products ({products.length})
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your agricultural crop listings, monitor review approvals, and add new harvest batches.
              </p>
            </div>

            <Link
              href="/seller/products/add"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 self-start sm:self-auto"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>Add New Product</span>
            </Link>
          </div>

          {/* Search & Status Filter Tabs Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "ALL"
                      ? "bg-[#174B35] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ACTIVE")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "ACTIVE"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Active ({counts.active})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("PENDING")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "PENDING"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Waiting Approval ({counts.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("DRAFT")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === "DRAFT"
                      ? "bg-gray-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Drafts ({counts.draft})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crop, variety, category..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
              </div>
            </div>
          </div>

          {/* Products List / Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200">
              Loading your products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/90 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-3xl">
                🌾
              </div>
              <h3 className="text-lg font-black text-gray-900">No products found</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {searchQuery
                  ? `No agricultural produce matched "${searchQuery}". Try a different keyword.`
                  : "You haven't listed any crops in this tab yet. Start by clicking 'Add New Product'."}
              </p>
              <Link
                href="/seller/products/add"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] shadow-xs"
              >
                <span>+ Add Product Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:border-[#729B59]/60 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Image & Status Tag */}
                  <div>
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
                        {product.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Active Listing
                          </span>
                        )}
                        {(product.status === "PENDING" || product.status === "WAITING_APPROVAL") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            Under Quality Review
                          </span>
                        )}
                        {product.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-700/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                            Draft (Not Submitted)
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
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
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

                    {/* Metadata line */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                      <span>MOQ: {product.minOrderQuantity} {product.moqUnit || product.unit}</span>
                      <span>Added: {product.createdAt || "Recent"}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-[#174B35] hover:bg-[#E8F0E3]/60 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Preview Card
                    </button>
                    <Link
                      href="/seller/products/add"
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                    >
                      Edit Produce
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Reusable Product Preview Modal */}
      <ProductPreviewModal
        isOpen={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        product={previewProduct}
      />
    </div>
  );
}
