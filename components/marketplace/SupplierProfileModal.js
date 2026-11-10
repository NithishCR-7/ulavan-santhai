"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getLocalBuyerAccessState,
  unlockSellerContact,
  getBuyerAccessEntitlement,
} from "@/services/sellerAccessApi";
import { B2B_CATALOG_PRODUCTS } from "@/data/marketplaceCatalog";

export default function SupplierProfileModal({
  isOpen,
  onClose,
  supplier,
  onOpenSendEnquiry,
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  const [quotaRemaining, setQuotaRemaining] = useState(10);
  const [supplierProducts, setSupplierProducts] = useState([]);

  useEffect(() => {
    if (!isOpen || !supplier) return;

    // Check if supplier is already unlocked
    const accessState = getLocalBuyerAccessState();
    const sellerId = supplier.id || supplier.sellerId;
    const unlocked = accessState.unlockedSellers.includes(sellerId);
    setIsUnlocked(unlocked);
    setQuotaRemaining(accessState.quotaRemaining ?? 10);
    setUnlockMessage("");

    // Find products published by this supplier
    const prods = B2B_CATALOG_PRODUCTS.filter(
      (p) => p.sellerId === sellerId || p.sellerName === supplier.name
    );
    setSupplierProducts(prods);
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const sellerId = supplier.id || supplier.sellerId;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setUnlockMessage("");

    try {
      const res = await unlockSellerContact("profile_view", sellerId, supplier.name);
      if (res.success) {
        setIsUnlocked(true);
        if (res.deducted) {
          setUnlockMessage("Contact details unlocked! 1 seller view deducted.");
        } else {
          setUnlockMessage("Supplier was already unlocked. 0 views deducted.");
        }
        setQuotaRemaining(res.quotaRemaining);
        window.dispatchEvent(new Event("ulavan_access_changed"));
      } else {
        if (res.reason === "QUOTA_EXHAUSTED") {
          setUnlockMessage(
            "Access quota exhausted (0 of 10 remaining). Top up your seller views (+10 views for ₹10) to unlock new suppliers."
          );
        } else {
          setUnlockMessage(res.error || "Failed to unlock contact. Please try again.");
        }
      }
    } catch (err) {
      setUnlockMessage("Error unlocking supplier details.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center text-xl font-black shrink-0">
              {supplier.name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  {supplier.name}
                </h3>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {supplier.sellerType} • {supplier.location || `${supplier.district}, Tamil Nadu`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {unlockMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                isUnlocked
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border border-amber-200 text-amber-800"
              }`}
            >
              {unlockMessage}
            </div>
          )}

          {/* Supplier Key Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase text-gray-400 font-semibold block">Proprietor</span>
              <span className="text-xs font-bold text-gray-800 block mt-0.5 truncate">
                {supplier.proprietor || "FPO Collective"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase text-gray-400 font-semibold block">Experience</span>
              <span className="text-xs font-bold text-gray-800 block mt-0.5">
                {supplier.establishedYear ? `Since ${supplier.establishedYear}` : "8+ Years"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase text-gray-400 font-semibold block">Scale</span>
              <span className="text-xs font-bold text-gray-800 block mt-0.5 truncate">
                {supplier.farmAcreage || "Bulk Producer"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase text-gray-400 font-semibold block">District</span>
              <span className="text-xs font-bold text-gray-800 block mt-0.5">
                {supplier.district || "Tamil Nadu"}
              </span>
            </div>
          </div>

          {/* Business Description */}
          {supplier.description && (
            <div className="p-4 bg-[#F5F5EB] rounded-2xl border border-gray-200/80">
              <h4 className="text-xs font-bold text-[#174B35] uppercase tracking-wider mb-1">
                About the Producer / Organization
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {supplier.description}
              </p>
            </div>
          )}

          {/* Direct Commercial Contact Section (Masked vs Unlocked) */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Direct Commercial Contact
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Direct phone, WhatsApp &amp; procurement desk
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isUnlocked
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isUnlocked ? "✓ Unlocked" : "Restricted Access"}
              </span>
            </div>

            {isUnlocked ? (
              /* UNLOCKED: Show real contact details with action links */
              <div className="pt-3.5 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block uppercase">Phone Number</span>
                      <a
                        href={`tel:${supplier.phone || "+919488212904"}`}
                        className="font-bold text-[#174B35] hover:underline"
                      >
                        {supplier.phone || "+91 94882 12904"}
                      </a>
                    </div>
                    <a
                      href={`tel:${supplier.phone || "+919488212904"}`}
                      className="px-2.5 py-1 rounded-lg bg-[#174B35] text-white text-[11px] font-bold"
                    >
                      Call
                    </a>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block uppercase">WhatsApp Desk</span>
                      <span className="font-bold text-gray-800">
                        {supplier.whatsapp || supplier.phone || "+91 94882 12904"}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${(supplier.whatsapp || supplier.phone || "919488212904").replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-[11px] font-bold"
                    >
                      Chat
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Procurement Email</span>
                    <a
                      href={`mailto:${supplier.email || "procurement@ulavansanthai.in"}`}
                      className="font-bold text-gray-800 hover:text-[#174B35] hover:underline"
                    >
                      {supplier.email || "procurement@ulavansanthai.in"}
                    </a>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified Desk
                  </span>
                </div>

                <div className="text-[11px] text-gray-500 text-center pt-1">
                  💡 This supplier is registered in your Unlocked Sellers list. You can re-visit anytime with <strong>0 views consumed</strong>.
                </div>
              </div>
            ) : (
              /* RESTRICTED: Masked view with unlock trigger */
              <div className="pt-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs opacity-75">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Phone Number</span>
                    <span className="font-mono font-bold text-gray-500">+91 ••••• •••••</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">WhatsApp Desk</span>
                    <span className="font-mono font-bold text-gray-500">+91 ••••• •••••</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block">
                      Unlock contact with 1 of your {quotaRemaining} remaining seller views.
                    </span>
                    <span className="text-[11px] text-amber-800 block mt-0.5">
                      Each supplier counts once. Repeat visits never consume quota.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {isUnlocking ? "Unlocking..." : "Unlock Contact (1 View)"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Published Catalog Listings by this Supplier */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
              Available Listings from this Supplier ({supplierProducts.length})
            </h4>

            {supplierProducts.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl border border-gray-200">
                No active standalone listings currently available. You can post a direct enquiry below.
              </p>
            ) : (
              <div className="space-y-2.5">
                {supplierProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl border border-gray-200 bg-white flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                        <Image
                          src={prod.image || "/images/about-farmer-harvest.jpg"}
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/marketplace/products/${prod.id}`}
                          onClick={onClose}
                          className="text-xs font-bold text-gray-900 hover:text-[#174B35] hover:underline"
                        >
                          {prod.title}
                        </Link>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          ₹{prod.price}/{prod.unit} • MOQ: {prod.moq} {prod.unit} • {prod.grade}
                        </div>
                      </div>
                    </div>
                    {onOpenSendEnquiry && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSendEnquiry(prod);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Enquire
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Internal KYC documents &amp; land records protected under privacy policy.
          </span>
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

