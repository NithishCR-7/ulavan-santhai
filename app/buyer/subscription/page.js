"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getBuyerAccessEntitlement,
  getBuyerAccessHistory,
  topUpBuyerQuota,
} from "@/services/sellerAccessApi";
import {
  CreditCardIcon,
  HomeIcon,
  ShieldCheckIcon,
  InfoIcon,
  CheckIcon,
  LockIcon,
  UnlockIcon,
  SearchIcon,
} from "@/components/marketplace/Icons";

export default function BuyerSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading seller access details...
        </div>
      }
    >
      <BuyerSubscriptionContent />
    </Suspense>
  );
}

function BuyerSubscriptionContent() {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [access, setAccess] = useState({
    quotaTotal: 10,
    quotaUsed: 3,
    quotaRemaining: 7,
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topUpMessage, setTopUpMessage] = useState("");
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const [ent, hist] = await Promise.all([
          getBuyerAccessEntitlement(buyerId),
          getBuyerAccessHistory(buyerId),
        ]);
        if (isMounted) {
          if (ent) {
            setAccess({
              quotaTotal: ent.totalViews || 10,
              quotaUsed: ent.viewsUsed || 0,
              quotaRemaining: ent.viewsRemaining ?? 10,
            });
          }
          if (Array.isArray(hist)) {
            setHistory(hist);
          }
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const handleTopUpRequest = async () => {
    setIsProcessingTopUp(true);
    setTopUpMessage("");
    try {
      const res = await topUpBuyerQuota();
      if (res && res.success) {
        setTopUpMessage("Top-up request registered: 10 additional seller views (+10 views for Rs 10).");
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const ent = await getBuyerAccessEntitlement(buyerId);
        if (ent) {
          setAccess({
            quotaTotal: ent.totalViews || 20,
            quotaUsed: ent.viewsUsed || 3,
            quotaRemaining: ent.viewsRemaining ?? 17,
          });
        }
      } else {
        setTopUpMessage("Additional access request noted. The backend team will activate your entitlement.");
      }
    } catch (e) {
      setTopUpMessage("Unable to request additional quota at this time.");
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
      />

      {/* 2. Main Container with Sidebar + Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: Seller Access Experience */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Seller Access &amp; Subscription</span>
            </nav>

            {/* Page Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#174B35] text-xs font-bold uppercase tracking-wider">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-[#174B35]" />
                <span>BRD 10.3 &amp; 10.4 Entitlement</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Seller Access &amp; Quota Manager
              </h1>
              <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                Your Rs 365 annual membership includes access to 10 unique farm producers. When you reach 0 remaining accesses, you can continue browsing the marketplace while adding packs of 10 accesses for Rs 10.
              </p>
            </div>

            {/* Quota Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs text-center sm:text-left">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total Entitlement
                </span>
                <div className="text-3xl font-black text-gray-900 mt-1">
                  {access.quotaTotal} Sellers
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  Standard membership base: 10
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-2xs text-center sm:text-left">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Unique Sellers Accessed
                </span>
                <div className="text-3xl font-black text-[#174B35] mt-1">
                  {access.quotaUsed}
                </div>
                <span className="text-xs text-emerald-700 mt-1 block">
                  Unlocked direct phone &amp; email
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-2xs text-center sm:text-left">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Remaining Accesses
                </span>
                <div className="text-3xl font-black text-amber-900 mt-1">
                  {access.quotaRemaining}
                </div>
                <span className="text-xs text-amber-700 mt-1 block">
                  Available for new suppliers
                </span>
              </div>
            </div>

            {/* Additional Access Package Card (BRD Section 10.4) */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    Additional Seller Access Package
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Need to connect with more agricultural suppliers? Top up your quota instantly.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#174B35]">Rs 10</div>
                  <span className="text-[10px] text-gray-400 font-semibold">+10 Verified Sellers</span>
                </div>
              </div>

              {topUpMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-semibold">
                  {topUpMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Immediate access activation &bull; Repeat contacts to same seller remain free</span>
                </div>
                <button
                  type="button"
                  onClick={handleTopUpRequest}
                  disabled={isProcessingTopUp}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isProcessingTopUp ? "Processing..." : "Add 10 Views (Rs 10)"}
                </button>
              </div>
            </div>

            {/* Access Rules Detailed Explanation */}
            <div className="bg-[#F8FAF7] rounded-3xl border border-emerald-200/70 p-6 space-y-3 text-xs text-gray-700">
              <h3 className="font-extrabold text-[#174B35] text-sm flex items-center gap-2">
                <InfoIcon className="w-4 h-4 text-[#174B35]" />
                <span>How Seller Access Entitlement Operates</span>
              </h3>
              <ul className="space-y-2 text-gray-600 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174B35] mt-1.5 shrink-0" />
                  <span>
                    <strong>1 access consumed only on first contact:</strong> The first time you enquire with a new farm producer or reveal their contact details, 1 seller view is deducted.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174B35] mt-1.5 shrink-0" />
                  <span>
                    <strong>Repeated contacts are always free:</strong> Re-visiting, following up, or sending multiple enquiries to an already unlocked seller consumes <strong>0 views</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174B35] mt-1.5 shrink-0" />
                  <span>
                    <strong>Saved products &amp; browsing remain unlimited:</strong> Browsing categories, searching listings, comparing specifications, and saving products to your wishlist never consume seller access.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174B35] mt-1.5 shrink-0" />
                  <span>
                    <strong>Locked state when quota is 0:</strong> At 0 remaining views, you can still explore all products. Enquiring with an 11th new seller requires adding a 10-view pack for Rs 10.
                  </span>
                </li>
              </ul>
            </div>

            {/* Access History List */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-sm text-gray-900">
                  Unlocked Suppliers History ({history.length})
                </h3>
                <span className="text-xs text-gray-400">All revealed contacts</span>
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <SearchIcon className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-gray-700">No sellers accessed yet</p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    When you send an enquiry or open direct seller details, your unlocked suppliers will appear here for easy reference.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {history.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold">
                          <UnlockIcon className="w-4 h-4 text-[#174B35]" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">
                            {item.sellerName || "Verified Producer"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Produce: {item.productTitle || "Agricultural Lot"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString("en-IN") : "Active Contact"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}

