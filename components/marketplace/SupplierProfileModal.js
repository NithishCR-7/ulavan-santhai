"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

export default function SupplierProfileModal({
  isOpen,
  onClose,
  supplier,
  onOpenSendEnquiry,
}) {
  const [supplierProducts, setSupplierProducts] = useState([]);

  useEffect(() => {
    if (!isOpen || !supplier) return;

    const sellerId = supplier.id || supplier.sellerId;
    const prods = B2B_CATALOG_PRODUCTS.filter(
      (p) => p.sellerId === sellerId || p.sellerName === supplier.name
    );
    setSupplierProducts(prods.length > 0 ? prods : B2B_CATALOG_PRODUCTS.slice(0, 3));
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Link: "← Back to Products" matching Screenshot 4 */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-[#174B35] flex items-center gap-1 cursor-pointer"
          >
            <span>&larr;</span>
            <span>Back to Products</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Supplier Header matching Screenshot 4 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden relative bg-emerald-50 border-2 border-emerald-200 shrink-0 shadow-xs">
              <Image
                src="/images/photographs/farmer-harvest.jpg"
                alt={supplier.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {supplier.name}
              </h3>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ✓ Verified Seller
                </span>
                <span className="text-amber-500 font-bold">
                  ★ {supplier.rating || 4.6}
                </span>
                <span className="text-gray-400">
                  ({supplier.reviewsCount || 312} reviews)
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {supplier.location || `${supplier.district || "Chennai"}, Tamil Nadu`}
              </p>

              {/* Action Buttons matching Screenshot 4: [Send Enquiry] & [View Products →] */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSendEnquiry && supplierProducts[0]) {
                      onOpenSendEnquiry(supplierProducts[0]);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✉ Send Enquiry</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:border-[#174B35] text-gray-700 hover:text-[#174B35] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Products</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* About Seller Description matching Screenshot 4 */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              About Seller
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {supplier.description ||
                "Supplying fresh and quality agricultural products directly from our farm and verified grower network. Strict quality assurance and timely dispatch."}
            </p>
          </div>

          {/* 3 Trust Badges matching Screenshot 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <strong className="text-xs font-extrabold text-gray-900 block leading-tight">
                  Trusted Seller
                </strong>
                <span className="text-[11px] text-gray-500">Verified by Us</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
              <span className="text-xl">🌾</span>
              <div>
                <strong className="text-xs font-extrabold text-gray-900 block leading-tight">
                  Quality Assured
                </strong>
                <span className="text-[11px] text-gray-500">Fresh &amp; Natural</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <strong className="text-xs font-extrabold text-gray-900 block leading-tight">
                  On-Time Support
                </strong>
                <span className="text-[11px] text-gray-500">Connect Easily</span>
              </div>
            </div>
          </div>

          {/* Similar Products Grid (3 Cards matching Screenshot 4) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Similar Products
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supplierProducts.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-gray-200 p-2.5 flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-50">
                    <Image
                      src={prod.thumbnail || prod.image || "/images/about-farmer-harvest.jpg"}
                      alt={prod.title}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-gray-900 truncate">{prod.title}</h5>
                    <div className="text-[11px] font-extrabold text-[#174B35]">
                      {prod.pricePerUnit ? `₹${prod.pricePerUnit} /${prod.unit}` : prod.moqDisplay || "Wholesale Lot"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenSendEnquiry) onOpenSendEnquiry(prod);
                    }}
                    className="w-full py-1.5 rounded-xl border border-[#174B35] text-[#174B35] hover:bg-[#E8F0E3] text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Enquire Seller
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}