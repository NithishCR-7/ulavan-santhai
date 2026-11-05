"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/onboarding/StatusBadge";
import { getApplicationStatus } from "@/services/onboardingApi";
import {
  checkRolePaymentStatus,
  approvePaymentReview,
  getLocalStoredReviews,
} from "@/services/paymentApi";

function ApplicationStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appIdFromQuery = searchParams.get("id");
  const roleFromQuery = searchParams.get("role") || "buyer";
  const [appId] = useState(() => {
    if (appIdFromQuery) return appIdFromQuery;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ulavan_latest_app_id") || "APP_US_SAMPLE001";
    }
    return "APP_US_SAMPLE001";
  });

  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentReviewState, setPaymentReviewState] = useState(() =>
    checkRolePaymentStatus(roleFromQuery)
  );
  const [isApprovingFastTrack, setIsApprovingFastTrack] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function loadStatus() {
      if (!appId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await getApplicationStatus(appId);
        if (isSubscribed) {
          if (res.success && res.data) {
            setStatusData(res.data);
          } else {
            setErrorMessage("Unable to locate application details.");
          }
          setPaymentReviewState(checkRolePaymentStatus(roleFromQuery));
        }
      } catch (err) {
        if (isSubscribed) {
          setErrorMessage(err.message || "Failed to load application status.");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadStatus();

    return () => {
      isSubscribed = false;
    };
  }, [appId, roleFromQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getApplicationStatus(appId);
      if (res.success && res.data) {
        setStatusData(res.data);
      }
      setPaymentReviewState(checkRolePaymentStatus(roleFromQuery));
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  // Instant fast-track approval helper for testing/demo
  const handleFastTrackApprove = async () => {
    setIsApprovingFastTrack(true);
    try {
      const reviews = getLocalStoredReviews();
      const pendingReview = reviews.find(
        (r) => r.role === roleFromQuery.toUpperCase() && r.reviewStatus === "PENDING_REVIEW"
      ) || reviews.find((r) => r.reviewStatus === "PENDING_REVIEW");

      if (pendingReview) {
        await approvePaymentReview(
          pendingReview.id,
          "Fast-track approved for evaluation.",
          "Verification Committee"
        );
      }
      setPaymentReviewState({ approved: true, status: "APPROVED" });
      handleRefresh();
    } catch (err) {
      console.error("Fast track error:", err);
    } finally {
      setIsApprovingFastTrack(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Loading Application Status...</h3>
        <p className="text-sm text-gray-500 mt-1">Fetching verification details from Ulavan Santhai</p>
      </div>
    );
  }

  const role = statusData?.payload?.role || (statusData?.buyerStatus && statusData?.sellerStatus ? "BOTH" : statusData?.sellerStatus ? "SELLER" : "BUYER");
  const isBoth = role === "BOTH";

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10 my-4">
      {/* Header with Title, Back Arrow and Overall Status */}
      <div className="flex items-start justify-between pb-6 border-b border-gray-100 flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer shadow-xs flex items-center justify-center mt-1"
            title="Go to previous page"
            aria-label="Go to previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ulavan Santhai Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Application Status
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Application ID: <span className="font-mono font-bold text-gray-800">{statusData?.applicationId || appId}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 block mb-1">Overall Status</span>
          <StatusBadge status={statusData?.overallStatus || "PENDING_REVIEW"} size="lg" />
        </div>
      </div>

      {/* Submission Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-gray-100 text-xs sm:text-sm">
        <div>
          <span className="text-gray-500 block">Submitted On</span>
          <span className="font-bold text-gray-900">{formatDate(statusData?.submissionDate)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Account Role</span>
          <span className="font-bold text-emerald-800">{role}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Classification</span>
          <span className="font-bold text-gray-900 truncate block">
            {statusData?.payload?.buyerType && statusData?.payload?.sellerType
              ? `${statusData.payload.buyerType} & ${statusData.payload.sellerType}`
              : statusData?.payload?.sellerType || statusData?.payload?.buyerType || "Verified Member"}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Fee &amp; Payment</span>
          <span className="font-bold text-emerald-700">₹365 Paid</span>
        </div>
      </div>

      {/* Stage 5: Payment & Membership Review Card */}
      <div className="py-5 border-b border-gray-100">
        {paymentReviewState.status === "PENDING_REVIEW" ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-950">
                  Stage 5: Payment Under Admin Review
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 font-extrabold text-xs">
                ⏳ Queued for Verification
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Your ₹365 membership payment has been received and is queued for verification by UlavanSanthai admin. Once reconciled with bank settlements, you will be cleared to proceed with Stage 5B: Detailed Business Onboarding.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleFastTrackApprove}
                disabled={isApprovingFastTrack}
                className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isApprovingFastTrack ? "Approving..." : "⚡ Fast-Track Approve (Instant Demo)"}
              </button>
              <Link
                href="/admin/payments"
                className="px-4 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 text-xs font-bold transition-colors"
              >
                Open Admin Review Portal &rarr;
              </Link>
            </div>
          </div>
        ) : paymentReviewState.status === "APPROVED" ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950">
                  Stage 5: Payment Approved by Admin
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
                ✓ Payment Verified
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Your ₹365 membership fee has been verified by the marketplace committee. You are cleared to proceed with <strong>Stage 5B: Business Category and Detailed Onboarding</strong>.
            </p>
            <div className="pt-2">
              <Link
                href={`/onboarding?role=${role.toLowerCase()}&approved=true`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Continue to Business Onboarding (Stage 5B)</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ) : paymentReviewState.status === "REJECTED" ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-300 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-red-950">
                  Payment Verification Rejected
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-xs">
                ✕ Action Required
              </span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Reason: {paymentReviewState.reason || "Transaction reference could not be matched with bank statements."}
            </p>
            <div className="pt-2">
              <Link
                href={`/onboarding/payment?role=${role.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Retry Payment &rarr;</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  ₹365 Membership Access
                </h4>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Ref: <span className="font-mono font-bold text-gray-800">{statusData?.payload?.payment?.transactionId || "TXN_US_365CONFIRMED"}</span> • {statusData?.payload?.payment?.plan || "Platform Membership"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
              ✓ Verified
            </span>
          </div>
        )}
      </div>

      {/* Review Breakdown: Separate for Buyer and Seller for BOTH accounts */}
      <div className="py-6 border-b border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Verification Review Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Buyer Profile Status (if Buyer or Both) */}
          {(role === "BUYER" || isBoth) && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Buyer Profile
                </span>
              </div>
              <StatusBadge status={statusData?.buyerStatus || "PENDING_REVIEW"} size="sm" />
              <p className="text-[11px] text-gray-500 mt-2">
                Logistics &amp; address verification
              </p>
            </div>
          )}

          {/* Seller Profile Status (if Seller or Both) */}
          {(role === "SELLER" || isBoth) && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Seller Profile
                </span>
              </div>
              <StatusBadge status={statusData?.sellerStatus || "PENDING_REVIEW"} size="sm" />
              <p className="text-[11px] text-gray-500 mt-2">
                Farm produce &amp; land verification
              </p>
            </div>
          )}

          {/* Document Verification Status */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </span>
            </div>
            <StatusBadge status={statusData?.documentStatus || "PENDING_REVIEW"} size="sm" />
            <p className="text-[11px] text-gray-500 mt-2">
              Identity &amp; certificate check
            </p>
          </div>
        </div>
      </div>

      {/* Admin Comments & Requested Corrections */}
      <div className="py-6 border-b border-gray-100 space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Official Verification Remarks
            </h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {statusData?.adminComments ||
              "Your application has been received by the Ulavan Santhai marketplace committee. Document verification is usually completed within 24 to 48 working hours."}
          </p>
        </div>

        {/* Changes Requested Section (if any) */}
        {statusData?.requestedCorrections && (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900">
                Action Required: Requested Corrections
              </h4>
            </div>
            <p className="text-sm text-orange-800 leading-relaxed">
              {statusData.requestedCorrections}
            </p>
            <div className="mt-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <span>Edit Application Details</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Verification Timeline Stepper */}
      <div className="py-6 border-b border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Verification Process Timeline
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold mx-auto flex items-center justify-center mb-1">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-900 block">Submitted</span>
            <span className="text-[10px] text-gray-500">Form Received</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold mx-auto flex items-center justify-center mb-1">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-900 block">Doc Verification</span>
            <span className="text-[10px] text-gray-500">Officer Checking</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold mx-auto flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-xs font-bold text-gray-700 block">Field Validation</span>
            <span className="text-[10px] text-gray-400">If Applicable</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold mx-auto flex items-center justify-center mb-1">
              4
            </div>
            <span className="text-xs font-bold text-gray-700 block">Market Live</span>
            <span className="text-[10px] text-gray-400">Trading Enabled</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>

          <Link
            href={`/dashboard?id=${encodeURIComponent(appId)}`}
            className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-semibold text-xs sm:text-sm shadow-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>Open Dashboard</span>
            <span>&rarr;</span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5"
          >
            <span>Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-emerald-700 font-bold p-8">Loading Status...</div>}>
        <ApplicationStatusContent />
      </Suspense>
    </div>
  );
}
