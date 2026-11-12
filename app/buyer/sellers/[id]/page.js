import { Suspense, use } from "react";
import BuyerSellerDetailsClient from "./BuyerSellerDetailsClient";
import { SELLER_DIRECTORY } from "@/data/marketplaceCatalog";

export async function generateStaticParams() {
  return SELLER_DIRECTORY.map((s) => ({
    id: s.id,
  }));
}

export default function BuyerSellerDetailsPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading supplier details...
        </div>
      }
    >
      <BuyerSellerResolver paramsPromise={params} />
    </Suspense>
  );
}

function BuyerSellerResolver({ paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  return <BuyerSellerDetailsClient sellerId={resolvedParams.id} />;
}
