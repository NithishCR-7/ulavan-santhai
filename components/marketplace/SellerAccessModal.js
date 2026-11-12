"use client";

import { useState, useEffect } from "react";
import {
  getBuyerAccessEntitlement,
  getBuyerAccessHistory,
  topUpBuyerQuota,
} from "@/services/sellerAccessApi";
import { CloseIcon, InfoIcon, SearchIcon } from "./Icons";

export function SellerAccessCard({ onOpenDetails, className = "" }) {
  const [access, setAccess] = useState({
    quotaTotal: 10,
    quotaUsed: 0,
    quotaRemaining: 10,
    unlockedSellers: [],
  });

  const loadData = async () => {
    try {
      const res = await getBuyerAccessEntitlement();
      if (res.success && res.data) {
        setAccess(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("ulavan_access_changed", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("ulavan_access_changed", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const percentUsed = Math.min(100, Math.round((access.quotaUsed / (access.quotaTotal || 10)) * 100));

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#174B35] tracking-wider uppercase bg-[#E8F0E3] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Seller Access Quota
          </span>
          <h4 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
            {access.quotaRemaining} of {access.quotaTotal} seller views left
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Each supplier counts once. Repeat visits never consume quota.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-black text-[#174B35]">{access.quotaRemaining}</span>
          <span className="text-[11px] text-gray-400 block font-semibold">Remaining</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            access.quotaRemaining > 3 ? "bg-[#174B35]" : access.quotaRemaining > 0 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.max(5, 100 - percentUsed)}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-1">
        <span className="text-gray-500">
          <strong className="text-gray-700">{access.quotaUsed}</strong> suppliers unlocked
        </span>
        <button
          type="button"
          onClick={onOpenDetails}
          className="text-xs font-bold text-[#174B35] hover:text-[#103A29] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>View Unlocked Sellers</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}

export default function SellerAccessModal({ isOpen, onClose }) {
  const [access, setAccess] = useState({
    quotaTotal: 10,
    quotaUsed: 0,
    quotaRemaining: 10,
    unlockedSellers: [],
  });
  const [history, setHistory] = useState([]);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshData = async () => {
    try {
      const res = await getBuyerAccessEntitlement();
      if (res.success && res.data) {
        setAccess(res.data);
      }
      const histRes = await getBuyerAccessHistory();
      if (histRes.success && Array.isArray(histRes.data)) {
        setHistory(histRes.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTopUp = async () => {
    setIsTopUpLoading(true);
    setMessage("");
    try {
      const res = await topUpBuyerQuota();
      if (res.success) {
        setMessage("Success: Added 10 additional seller views (+10 views for ₹10)!");
        await refreshData();
      }
    } catch (e) {
      setMessage("Failed to top-up quota. Please try again.");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
              <span>BRD 10.4 Entitlement</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              My Seller Access &amp; Quota
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Access up to 10 verified suppliers on the platform. Each unique supplier counts once.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#174B35] text-xs font-semibold">
              {message}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 text-center">
              <span className="text-[11px] font-semibold text-gray-500 block uppercase">Total Views</span>
              <span className="text-2xl font-black text-gray-900 mt-0.5 block">{access.quotaTotal}</span>
              <span className="text-[10px] text-gray-400">Plan base: 10</span>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-center">
              <span className="text-[11px] font-semibold text-emerald-800 block uppercase">Views Used</span>
              <span className="text-2xl font-black text-[#174B35] mt-0.5 block">{access.quotaUsed}</span>
              <span className="text-[10px] text-emerald-600">Unique Sellers</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-center">
              <span className="text-[11px] font-semibold text-amber-800 block uppercase">Remaining</span>
              <span className="text-2xl font-black text-amber-900 mt-0.5 block">{access.quotaRemaining}</span>
              <span className="text-[10px] text-amber-600">Views Left</span>
            </div>
          </div>

          {/* Rules Explanation Callout */}
          <div className="p-3.5 bg-[#F5F5EB] rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1.5">
            <div className="font-bold text-[#174B35] flex items-center gap-1.5">
              <InfoIcon className="w-4 h-4 text-[#174B35]" />
              <span>How Seller Access Works</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[11px]">
              <li>You can view phone number, WhatsApp and email of up to 10 distinct sellers.</li>
              <li>1 view is deducted only the <strong>first time</strong> you unlock a supplier.</li>
              <li>Re-visiting an already unlocked seller consumes <strong>0 views</strong>.</li>
              <li>Sensitive verification documents (Aadhaar, Land records) always remain confidential.</li>
            </ul>
          </div>

          {/* Unlocked Sellers List */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
              Unlocked Suppliers ({history.length})
            </h4>

            {history.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
                <SearchIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">No sellers unlocked yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Browse products and click &quot;View Supplier&quot; to unlock their direct commercial contact details.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{item.sellerName || item.sellerId}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                          Unlocked
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {item.productTitle ? `Product: ${item.productTitle}` : "Direct Contact Access"}
                        {item.unlockedAt && ` • ${new Date(item.unlockedAt).toLocaleDateString("en-IN")}`}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#174B35] bg-[#E8F0E3] px-2 py-0.5 rounded">
                      0 Views on Revisit
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top-up Notice (BRD 10.4) */}
          {access.quotaRemaining <= 3 && (
            <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#174B35] block">Need to unlock more suppliers?</span>
                <span className="text-[11px] text-gray-600 block mt-0.5">
                  BRD 10.4 Add-on: Top up 10 additional seller views for ₹10.
                </span>
              </div>
              <button
                type="button"
                onClick={handleTopUp}
                disabled={isTopUpLoading}
                className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isTopUpLoading ? "Adding..." : "+10 Views (₹10)"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

