"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getAdminPaymentReviews,
  approvePaymentReview,
  rejectPaymentReview,
} from "@/services/paymentApi";

export default function AdminPaymentsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | PENDING_REVIEW | APPROVED | REJECTED

  // Action Modal State
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT'
  const [actionRemarks, setActionRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const res = await getAdminPaymentReviews(filterStatus);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error("Error loading admin reviews:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [filterStatus]);

  const refreshReviews = async () => {
    try {
      const res = await getAdminPaymentReviews(filterStatus);
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error("Error refreshing admin reviews:", err);
    }
  };

  const handleOpenAction = (review, type) => {
    setSelectedReview(review);
    setActionType(type);
    setActionRemarks(
      type === "APPROVE"
        ? "Payment verified against bank settlement statement. Approved for marketplace onboarding."
        : "Reference ID not found in bank settlement. Please upload valid proof or retry."
    );
    setActionSuccess("");
    setActionError("");
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      if (actionType === "APPROVE") {
        const res = await approvePaymentReview(
          selectedReview.id,
          actionRemarks.trim(),
          "Admin Officer (ID #04)"
        );
        if (res.success) {
          setActionSuccess("✓ Payment approved! User has been granted access to business onboarding.");
          refreshReviews();
          setTimeout(() => {
            setSelectedReview(null);
          }, 1500);
        } else {
          setActionError(res.error || "Failed to approve payment.");
        }
      } else if (actionType === "REJECT") {
        const res = await rejectPaymentReview(
          selectedReview.id,
          actionRemarks.trim(),
          "Admin Officer (ID #04)"
        );
        if (res.success) {
          setActionSuccess("✓ Payment rejected. Reason recorded and refund queue flagged.");
          refreshReviews();
          setTimeout(() => {
            setSelectedReview(null);
          }, 1500);
        } else {
          setActionError(res.error || "Failed to reject payment.");
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      setActionError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = reviews.filter((r) => r.reviewStatus === "PENDING_REVIEW").length;
  const approvedCount = reviews.filter((r) => r.reviewStatus === "APPROVED").length;
  const rejectedCount = reviews.filter((r) => r.reviewStatus === "REJECTED").length;

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Admin Top Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-sm border border-gray-200 group-hover:scale-105 transition-transform">
              <Image
                src="/images/ulavan-santhai-emblem@2x.png"
                alt="Ulavan Santhai Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#174B35] tracking-tight leading-tight">
                  Ulavan Santhai
                </span>
                <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded uppercase">
                  Admin Portal
                </span>
              </div>
              <span className="text-[11px] tracking-wider uppercase font-extrabold text-[#729B59]">
                Payment Review &amp; Onboarding Approvals
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding/status"
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#174B35] bg-white transition-colors"
            >
              User Status View &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-6">
        {/* Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Payment Review Requests
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Reconcile ₹365 membership fees against bank settlement records and unlock user onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              {pendingCount} Pending Action
            </span>
          </div>
        </div>

        {/* Metric Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
            <span className="text-xs text-gray-400 font-bold block">Total Requests</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{reviews.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
            <span className="text-xs text-amber-700 font-bold block">Pending Review</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">{pendingCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs text-emerald-700 font-bold block">Approved</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{approvedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
            <span className="text-xs text-gray-400 font-bold block">Rejected / Refunded</span>
            <span className="text-2xl font-black text-gray-700 mt-1 block">{rejectedCount}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: `All Requests (${reviews.length})` },
            { id: "PENDING_REVIEW", label: `Pending (${pendingCount})` },
            { id: "APPROVED", label: `Approved (${approvedCount})` },
            { id: "REJECTED", label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-[#174B35] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Listing */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">
            <div className="w-6 h-6 border-2 border-[#174B35]/30 border-t-[#174B35] rounded-full animate-spin mx-auto mb-2"></div>
            Loading review requests...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/90 shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <h3 className="text-base font-bold text-gray-900">No Review Requests Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are currently no payment requests matching this filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs ${
                  rev.reviewStatus === "PENDING_REVIEW"
                    ? "border-amber-300 bg-amber-50/10"
                    : "border-gray-200/90"
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {rev.reviewStatus === "PENDING_REVIEW" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting Admin Review
                      </span>
                    )}
                    {rev.reviewStatus === "APPROVED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                        ✓ Approved
                      </span>
                    )}
                    {rev.reviewStatus === "REJECTED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-900">
                        ✕ Rejected
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full">
                      {rev.role} Plan
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Ref: {rev.transactionId}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      {rev.userName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ({rev.userEmail} &bull; +91 {rev.userMobile})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span>Plan: <strong>{rev.planName || "₹365 Membership"}</strong></span>
                    <span>&bull;</span>
                    <span>Method: <strong>{rev.paymentMethod}</strong></span>
                    <span>&bull;</span>
                    <span>Gateway Ref: <code className="font-mono">{rev.gatewayReference}</code></span>
                    <span>&bull;</span>
                    <span className="font-bold text-[#174B35]">Amount: ₹{rev.amount}</span>
                  </div>

                  {rev.remarks && (
                    <p className="text-xs text-gray-500 italic bg-[#F5F5EB] p-2 rounded-xl border border-gray-200/60">
                      Remarks: &ldquo;{rev.remarks}&rdquo;
                      {rev.reviewedBy && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Reviewed by {rev.reviewedBy} on {new Date(rev.reviewedAt || rev.submittedAt || "2026-11-04").toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {rev.reviewStatus === "PENDING_REVIEW" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(rev, "REJECT")}
                        className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(rev, "APPROVE")}
                        className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>✓ Approve &amp; Unlock</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      Review Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Action Confirmation Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Audit Decision
                </span>
                <h3 className="text-lg font-black text-gray-900">
                  {actionType === "APPROVE" ? "Approve Payment Review" : "Reject Payment Request"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5EB] border border-gray-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">User:</span>
                <span className="font-bold text-gray-900">{selectedReview.userName} ({selectedReview.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount / Plan:</span>
                <span className="font-bold text-[#174B35]">₹{selectedReview.amount} ({selectedReview.planName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono text-gray-700">{selectedReview.transactionId}</span>
              </div>
            </div>

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {actionType === "APPROVE" ? "Verification Officer Remarks" : "Rejection Reason (Visible to User)"}
                </label>
                <textarea
                  rows={3}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                    actionType === "APPROVE"
                      ? "bg-[#174B35] hover:bg-[#103A29]"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting
                    ? "Recording Decision..."
                    : actionType === "APPROVE"
                    ? "Confirm Approval & Unlock"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
