"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductMarketplaceCard({ product }) {
  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : product.thumbnail || "/images/about-farmer-harvest.jpg";

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:border-[#729B59]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      <div>
        {/* Product Photograph & Tags */}
        <div className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs">
          <Image
            src={displayImage}
            alt={product.title || "Agricultural Produce"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#174B35]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
              {product.grade || "Grade A"}
            </span>
            {product.organicStatus && product.organicStatus !== "Conventional Farming" && (
              <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                <span>🌿</span>
                <span>Organic</span>
              </span>
            )}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
            {product.category}
          </div>
        </div>

        {/* Product Title & Variety */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span className="truncate max-w-[180px]">{product.variety || "Standard Variety"}</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 text-[10px]">
              Direct from Producer
            </span>
          </div>

          <h3 className="text-base font-black text-gray-900 group-hover:text-[#174B35] transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Stock Card */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-[#F5F5EB] border border-gray-200/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
              Wholesale Price
            </span>
            <span className="text-base sm:text-lg font-black text-[#174B35]">
              ₹{Number(product.pricePerUnit || 0).toLocaleString("en-IN")}
              <span className="text-xs font-semibold text-gray-600"> / {product.unit}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
              Available Stock
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-900">
              {Number(product.availableStock || 0).toLocaleString("en-IN")} {product.unit}
            </span>
          </div>
        </div>

        {/* Origin & Seller Business Information */}
        <div className="mt-3 space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Seller / Entity:</span>
            <span className="font-bold text-gray-800 truncate max-w-[190px]">
              {product.sellerName || "Kongu Verified Farm"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Origin District:</span>
            <span className="font-semibold text-gray-700">
              {product.originDistrict || "Coimbatore"}, {product.originState || "Tamil Nadu"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Min. Order (MOQ):</span>
            <span className="font-bold text-[#174B35]">
              {Number(product.minOrderQuantity || 1).toLocaleString("en-IN")}{" "}
              {product.moqUnit || product.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action: View Details Button */}
      <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Verified Lot</span>
        </div>

        <Link
          href={`/marketplace/products/${product.id}`}
          className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Details</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

