import { Suspense, use } from "react";
import ProductDetailsClient from "@/app/marketplace/products/[id]/ProductDetailsClient";
import { B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

export async function generateStaticParams() {
  return B2B_CATALOG_PRODUCTS.map((prod) => ({
    id: prod.id,
  }));
}

export default function BuyerProductDetailsRoute({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-[#174B35]/30 border-t-[#174B35] rounded-full animate-spin" />
            <span>Loading verified produce specifications...</span>
          </div>
        </div>
      }
    >
      <BuyerProductResolver paramsPromise={params} />
    </Suspense>
  );
}

function BuyerProductResolver({ paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  return <ProductDetailsClient productId={resolvedParams.id} />;
}

