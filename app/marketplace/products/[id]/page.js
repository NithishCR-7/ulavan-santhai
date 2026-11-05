import { Suspense, use } from "react";
import ProductDetailsClient from "./ProductDetailsClient";

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

export default function ProductDetailsPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-[#174B35]/30 border-t-[#174B35] rounded-full animate-spin"></span>
            <span>Loading verified produce specifications...</span>
          </div>
        </div>
      }
    >
      <ProductDetailsResolver paramsPromise={params} />
    </Suspense>
  );
}

function ProductDetailsResolver({ paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  return <ProductDetailsClient productId={resolvedParams.id} />;
}
