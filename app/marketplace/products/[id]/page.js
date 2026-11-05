import { Suspense, use } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import { getMarketplaceProducts } from "@/services/marketplaceApi";

export async function generateStaticParams() {
  return [
    { id: "prod_101" },
    { id: "prod_102" },
    { id: "prod_103" },
    { id: "prod_105" },
    { id: "prod_106" },
    { id: "prod_107" },
  ];
}

export default function ProductDetailsStubPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading produce details...
        </div>
      }
    >
      <ProductDetailsInner paramsPromise={params} />
    </Suspense>
  );
}

function ProductDetailsInner({ paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const productId = resolvedParams.id;

  const seedProducts = [
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
      originDistrict: "Salem",
      originState: "Tamil Nadu",
      sellerName: "Kongu Natural Organic Farms",
      thumbnail: "/images/about-farmer-harvest.jpg",
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
      originDistrict: "Nilgiris",
      originState: "Tamil Nadu",
      sellerName: "Nilgiris Horticulture Farmer Society",
      thumbnail: "/images/about-farmer-harvest.jpg",
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
      originDistrict: "Erode",
      originState: "Tamil Nadu",
      sellerName: "Kongu Traditional Chekku Producers",
      thumbnail: "/images/about-farmer-harvest.jpg",
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
      originDistrict: "Tiruvannamalai",
      originState: "Tamil Nadu",
      sellerName: "Javadi Hills Tribal Honey Society",
      thumbnail: "/images/about-farmer-harvest.jpg",
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
      originDistrict: "Thanjavur",
      originState: "Tamil Nadu",
      sellerName: "Cauvery Delta Uzhavar Producer Company",
      thumbnail: "/images/about-farmer-harvest.jpg",
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
      originDistrict: "Dindigul",
      originState: "Tamil Nadu",
      sellerName: "Dindigul Traditional Agri Farmers",
      thumbnail: "/images/about-farmer-harvest.jpg",
    },
  ];

  const product = seedProducts.find((p) => String(p.id) === String(productId)) || {
    id: productId,
    title: "Agricultural Produce",
    category: "Produce",
    pricePerUnit: 0,
    unit: "kg",
    availableStock: 0,
    minOrderQuantity: 1,
    moqUnit: "kg",
    originDistrict: "Tamil Nadu",
    originState: "Tamil Nadu",
    sellerName: "Verified Cultivator",
    thumbnail: "/images/about-farmer-harvest.jpg",
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      <MarketplaceHeader />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-[#174B35] hover:text-[#103A29] text-xs font-bold hover:border-[#174B35]/40 transition-all shadow-2xs"
          >
            <span>&larr;</span>
            <span>Back to Marketplace</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-semibold text-gray-500 truncate max-w-xs">{product.title}</span>
        </div>

        {/* Task 6 Preparation Notice */}
        <div className="p-4 rounded-2xl bg-[#E8F0E3] border border-[#729B59]/40 text-[#174B35] text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>
              <strong>Navigation Verified (ID: {productId}):</strong> Complete Product Details and Seller Contact Unlocking will be built in Task 6.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] bg-white/80 px-2 py-0.5 rounded border border-[#729B59]/30">
            Task 5 &rarr; Task 6 Link
          </span>
        </div>

        {/* Product Card Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
              <Image
                src={product.thumbnail || "/images/about-farmer-harvest.jpg"}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold mb-2">
                <span>{product.category}</span>
                <span>&bull;</span>
                <span>{product.grade || "Grade A"}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {product.title}
              </h1>

              {product.variety && (
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Variety: <strong className="text-gray-800">{product.variety}</strong>
                </p>
              )}

              <div className="mt-4 p-4 rounded-2xl bg-[#F5F5EB] border border-gray-200/70 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#174B35]">
                  ₹{Number(product.pricePerUnit || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold text-gray-600">/ {product.unit || "kg"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Producer / Entity</span>
                <span className="font-bold text-gray-900">{product.sellerName || "Verified Producer"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Origin Location</span>
                <span className="font-bold text-gray-900">
                  {product.originDistrict || "Coimbatore"}, {product.originState || "Tamil Nadu"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Available Harvest Stock</span>
                <span className="font-bold text-gray-900">
                  {Number(product.availableStock || 0).toLocaleString("en-IN")} {product.unit || "kg"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Minimum Order Quantity</span>
                <span className="font-bold text-gray-900">
                  {Number(product.minOrderQuantity || 1).toLocaleString("en-IN")}{" "}
                  {product.moqUnit || product.unit || "kg"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>&larr; Return to All Marketplace Lots</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
