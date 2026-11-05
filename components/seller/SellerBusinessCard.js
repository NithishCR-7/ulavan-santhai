"use client";

import Link from "next/link";

export default function SellerBusinessCard({
  sellerInfo,
  showEditButton = true,
}) {
  const sellerType = sellerInfo?.sellerType || "Farmer";
  const sellerData = sellerInfo?.sellerData || {};

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
      {/* Header with Classification Badge & Edit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-black uppercase tracking-wider border border-[#729B59]/30">
              {sellerType}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Seller
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Your Farm &amp; Business Profile
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified agricultural details from your onboarding application (ID: <span className="font-mono text-gray-800 font-bold">{sellerInfo?.applicationId || "APP_US_982412"}</span>)
          </p>
        </div>

        {showEditButton && (
          <Link
            href="/seller/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#E8F0E3] text-gray-800 hover:text-[#174B35] font-bold text-xs transition-colors shrink-0"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Profile</span>
          </Link>
        )}
      </div>

      {/* Dynamic Classification-Specific Fields: Only show relevant fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* 1. Farmer Specific */}
        {sellerType === "Farmer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Farm / Thottam Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.farmerFarmName || "Kongu Natural Organic Farms"}</p>
              <p className="text-gray-500 text-xs">{sellerData.farmerCategory || "Landowner Farmer"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Land Size &amp; Method</span>
              <p className="font-black text-[#174B35] text-sm sm:text-base">{sellerData.farmerLandSize || "2 - 5 Acres"}</p>
              <p className="text-gray-600 text-xs">{sellerData.farmerMethod || "Conventional Farming"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Crops Cultivated</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(sellerData.farmerCrops || ["Coconut", "Banana", "Turmeric"]).map((crop) => (
                  <span key={crop} className="px-2.5 py-1 rounded-lg bg-[#E8F0E3] text-[#174B35] font-bold text-xs">
                    ✓ {crop}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Harvest Season</span>
              <p className="font-bold text-gray-900 text-sm">{sellerData.farmerHarvestMonths || "All Year"}</p>
              <p className="text-gray-500 text-xs">Available Volume: {sellerData.farmerAvailableQty || "50 Quintals"}</p>
            </div>
          </>
        )}

        {/* 2. Agricultural Producer (FPO / Cooperative) */}
        {sellerType === "Agricultural Producer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Legal Organization Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.fpoName || "Kongu Uzhavar Producer Company Ltd"}</p>
              <p className="text-gray-500 font-mono text-[11px]">CIN/Reg: {sellerData.fpoRegNumber || "U01409TZ2021PTC028491"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Organization Structure</span>
              <p className="font-black text-[#174B35] text-sm sm:text-base">{sellerData.fpoStructure || "Farmer Producer Company (FPC)"}</p>
              <p className="text-gray-600 text-xs">Member Count: {sellerData.fpoMemberCount || "200 - 500 Farmers"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Combined Supply Capacity</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.fpoCapacity || "150 Metric Tonnes"}</p>
              <p className="text-gray-500 text-xs">Collective farmer aggregation</p>
            </div>
          </>
        )}

        {/* 3. Certified Organic Producer */}
        {sellerType === "Organic Producer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Organic Brand / Farm Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.organicFarmName || "Pristine Nature Organic Farm"}</p>
              <p className="text-emerald-700 font-bold text-xs">✓ {sellerData.organicCertStatus || "Certified Organic (NPOP)"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Certification Agency</span>
              <p className="font-black text-[#174B35] text-sm sm:text-base">{sellerData.organicCertAgency || "Aditi Organic / OneCert"}</p>
              <p className="text-gray-500 font-mono text-[11px]">Certificate: {sellerData.organicScopeNumber || "NPOP/NAB/0017/ORG-2024"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Cultivation Practice</span>
              <p className="font-medium text-gray-800 text-xs">{sellerData.organicMethod || "Panchagavya & Natural Zero-Chemical Farming"}</p>
            </div>
          </>
        )}

        {/* 4. Raw Material Provider */}
        {sellerType === "Raw-Material Provider" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Business / Provider Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.rawProviderName || "Cauvery Raw Agri Commodities"}</p>
              <p className="text-gray-500 text-xs">Constitution: {sellerData.rawConstitution || "Proprietorship"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Warehouse Capacity &amp; MOQ</span>
              <p className="font-black text-[#174B35] text-sm sm:text-base">{sellerData.rawStockCapacity || "100 Metric Tonnes"}</p>
              <p className="text-gray-600 text-xs">Minimum Order: {sellerData.rawMoq || "1 Metric Tonne"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Raw Materials Supplied</span>
              <p className="font-medium text-gray-800 text-xs">
                {Array.isArray(sellerData.rawCommodities) ? sellerData.rawCommodities.join(", ") : sellerData.rawCommodities || "Turmeric Bulbs, Coconut Copra, Castor Seeds"}
              </p>
            </div>
          </>
        )}

        {/* 5. Agri-Ingredient Producer */}
        {sellerType === "Ingredient Producer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Enterprise Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.ingProducerName || "Kongu Traditional Chekku Oils"}</p>
              <p className="text-gray-500 text-xs">Milling: {sellerData.ingTechnology || "Cold-pressed wooden chekku"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">FSSAI Food License</span>
              <p className="font-mono font-bold text-[#174B35] text-sm sm:text-base">{sellerData.ingFssaiNumber || "10020042000789"}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">✓ 14-Digit Validated</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Ingredients Produced</span>
              <p className="font-medium text-gray-800 text-xs">{sellerData.ingProducts || "Wood Pressed Oils, Dehydrated Onion Powder, Tamarind Paste"}</p>
            </div>
          </>
        )}

        {/* 6. Industrial Agro-Manufacturer */}
        {sellerType === "Manufacturer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Company Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.mfgSellerName || "Salem Agro Refineries Ltd"}</p>
              <p className="text-gray-500 text-xs">{sellerData.mfgSellerConstitution || "Private Limited"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Monthly Manufacturing Capacity</span>
              <p className="font-black text-[#174B35] text-sm sm:text-base">{sellerData.mfgCapacity || "200 Metric Tonnes"}</p>
              <p className="text-gray-600 text-xs">Finished Goods: {sellerData.mfgProductsOffered || "Refined Agri Oils, Cattle Feed"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Local Farm Inputs Sourced</span>
              <p className="font-medium text-gray-800 text-xs">{sellerData.mfgRawMaterialsUsed || "Groundnut Pods, Cottonseed, Rice Husk"}</p>
            </div>
          </>
        )}

        {/* 7. Value-Added Manufacturer */}
        {sellerType === "Value-Added Manufacturer" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Brand / Enterprise Name</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.vaBrandName || "Madurai Traditional Pickles & Snacks"}</p>
              <p className="text-gray-500 text-xs">Packaging: {sellerData.vaPackaging || "Glass Jars & Pouches"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">FSSAI Food License</span>
              <p className="font-mono font-bold text-[#174B35] text-sm sm:text-base">{sellerData.vaFssaiNumber || "10020042000999"}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">✓ Food License Verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Product Line</span>
              <p className="font-medium text-gray-800 text-xs">{sellerData.vaProducts || "Traditional Pickles, Millet Snacks, Sundried Vathal"}</p>
            </div>
          </>
        )}

        {/* 8. Other Seller */}
        {sellerType === "Other" && (
          <>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Producer Entity</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{sellerData.otherSellerName || "Specialty Herbal Agri Unit"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Agricultural Specialty</span>
              <p className="font-medium text-gray-800 text-xs">{sellerData.otherActivity || "Contract farming of rare indigenous herbs and medicinal extracts"}</p>
            </div>
          </>
        )}
      </div>

      {/* Operating Location & Verification Document Status */}
      <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Operating Farm / Facility Location */}
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174B35]">
            <svg className="w-4 h-4 text-[#729B59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Operating Farm / Location</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
            {sellerData.farmAddress || sellerInfo?.farmAddress || "No. 12, Thottam Road, Anaimalai"}
          </p>
          <p className="text-xs text-gray-500">
            {sellerData.village || sellerInfo?.village || "Anaimalai"}, {sellerData.district || sellerInfo?.district || "Coimbatore"} District, Tamil Nadu — {sellerData.pinCode || sellerInfo?.pinCode || "642001"}
          </p>
        </div>

        {/* Document Verification Status */}
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174B35]">
            <svg className="w-4 h-4 text-[#729B59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verification Documents</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Identity Proof */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80">
              <span className="text-gray-700 font-medium truncate mr-1">Identity Proof</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                ✓ Verified
              </span>
            </div>

            {/* Land Records (Farmers/Organic) or Trade License */}
            {(sellerType === "Farmer" || sellerType === "Organic Producer") ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80">
                <span className="text-gray-700 font-medium truncate mr-1">Land Records</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                  ✓ Uploaded
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80">
                <span className="text-gray-700 font-medium truncate mr-1">Trade License</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                  ✓ Verified
                </span>
              </div>
            )}

            {/* FSSAI Food License */}
            {(sellerType === "Ingredient Producer" || sellerType === "Value-Added Manufacturer" || sellerType === "Manufacturer") && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80">
                <span className="text-gray-700 font-medium truncate mr-1">FSSAI Food</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                  ✓ Active
                </span>
              </div>
            )}

            {/* Annual ₹365 Membership */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80">
              <span className="text-gray-700 font-medium truncate mr-1">Membership</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                ✓ Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reassuring Explanation Callout */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2.5">
        <svg className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-relaxed">
          <strong>Seller Profile Notice:</strong> This profile describes your registered agricultural entity and credentials. Your individual harvest batches, prices, and stock units are listed and managed separately under <Link href="/seller/products" className="font-bold underline hover:text-[#174B35]">My Products</Link>.
        </span>
      </div>
    </div>
  );
}
