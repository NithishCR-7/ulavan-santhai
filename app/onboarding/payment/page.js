"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PaymentView from "@/components/onboarding/PaymentView";
import { useSessionUser } from "@/services/sessionAuth";

function PaymentContent() {
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "buyer").toLowerCase();
  const role = roleParam === "seller" ? "seller" : "buyer";
  const userAuth = useSessionUser();

  return (
    <PaymentView
      role={role}
      userAuth={userAuth}
    />
  );
}

export default function OnboardingPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#174B35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

