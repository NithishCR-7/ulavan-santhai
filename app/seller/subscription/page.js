"use client";

import { useState } from "react";
import Link from "next/link";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { getLocalStoredPayments, PRICING_PLANS } from "@/services/paymentApi";
import { getLocalSellerProfile } from "@/services/sellerApi";

export default function SellerSubscriptionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sellerProfile] = useState(() => getLocalSellerProfile());

  const [paymentRecord] = useState(() => {
    const payments = getLocalStoredPayments();
    return payments.find((p) => p.role === "SELLER") || payments[0];
  });

  const plan = PRICING_PLANS.SELLER;

  const formatDate = (dateStr) => {
    if (!dateStr) return "30 Days from Activation";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      <SellerHeader
        sellerName={sellerProfile?.name || "Farmer Ramesh Kumar"}
        sellerType={sellerProfile?.sellerType || "Organic Producer"}
        farmName={sellerProfile?.farmName || "Kongu Natural Organic Farms"}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        <SellerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Link href="/seller/dashboard" className="text-[#174B35] font-bold hover:underline">
                  Seller Dashboard
                </Link>
                <span>/</span>
                <span className="text-gray-400">Subscription &amp; Membership</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight">
                Seller Membership &amp; Listing Plan
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Active monthly subscription for agricultural product showcasing and direct buyer enquiry access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                ✓ Plan Active
              </span>
            </div>
          </div>

          {/* Active Plan Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#729B59] bg-[#E8F0E3] px-3 py-1 rounded-full">
                  Verified Producer Tier
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                  {plan.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Ref: <span className="font-mono font-bold text-gray-800">{paymentRecord?.transactionId || "TXN_US_365ACTIVE"}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 font-bold uppercase block">Monthly Subscription</span>
                <div className="text-3xl font-black text-[#174B35]">
                  ₹{plan.totalAmount} <span className="text-xs text-gray-500 font-bold">/ month</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  Next Renewal: {formatDate(paymentRecord?.renewalDueDate)}
                </span>
              </div>
            </div>

            {/* Key Subscription Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80">
                <span className="text-gray-400 block text-[11px]">Activation Date</span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {formatDate(paymentRecord?.planStartDate || "2026-11-04")}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80">
                <span className="text-gray-400 block text-[11px]">Renewal Due Date</span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {formatDate(paymentRecord?.renewalDueDate)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80">
                <span className="text-gray-400 block text-[11px]">Payment Method</span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {paymentRecord?.paymentMethod || "UPI"} (Automated Settlement)
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80">
                <span className="text-gray-400 block text-[11px]">Invoice Ref</span>
                <span className="font-mono font-bold text-gray-900 mt-0.5 block">
                  {paymentRecord?.invoiceNumber || "INV-US-2026-00412"}
                </span>
              </div>
            </div>

            {/* Active Platform Privileges */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Active Platform Privileges &amp; Guarantees:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                {plan.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      ✓
                    </span>
                    <span className="font-medium">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                Automatic renewal alerts are sent 3 days before expiry.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Print Subscription Receipt
                </button>
                <Link
                  href="/onboarding/payment?role=seller"
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Manage / Renew Plan &rarr;
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

