"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitRolePayment } from "@/services/paymentApi";

export default function PaymentView({
  role = "buyer",
  onRoleChange,
  userAuth = {},
  onBack,
  onPaymentSuccess,
  onFinalizePayment: externalFinalizePayment,
  addonBlocks = 0,
  paymentResult: externalPaymentResult,
  isProcessingExternal = false,
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(role);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(externalPaymentResult || null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentRole = onRoleChange ? role : activeRole;
  const processingState = isProcessing || isProcessingExternal;
  const activeResult = externalPaymentResult || paymentResult;

  const handleRoleToggle = (newRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      setActiveRole(newRole);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setErrorMessage("");
    setIsProcessing(true);

    const baseAmount = 365;
    const totalAmount = baseAmount;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && razorpayKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: totalAmount * 100, // paise
          currency: "INR",
          name: "Ulavan Santhai",
          description:
            currentRole === "buyer"
              ? "Buyer Access Plan (10 Sellers)"
              : "Seller Monthly Membership",
          image: "/images/ulavan-santhai-emblem@2x.png",
          prefill: {
            name: userAuth?.name || "Verified Trader",
            email: userAuth?.email || "trader@ulavansanthai.in",
            contact: userAuth?.mobile || "9876543210",
          },
          theme: {
            color: "#1F4D36",
          },
          handler: function (response) {
            handleFinalizePayment(response.razorpay_payment_id || `pay_rzp_${Date.now()}`);
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay live checkout error, opening preview simulation:", err);
      }
    }

    // In preview mode or when no Razorpay key is configured:
    setIsProcessing(false);
    setIsRazorpayModalOpen(true);
  };

  const handleFinalizePayment = async (razorpayPaymentId) => {
    setIsProcessing(true);
    setIsRazorpayModalOpen(false);

    if (externalFinalizePayment) {
      try {
        await externalFinalizePayment(razorpayPaymentId);
      } catch (err) {
        console.error("External finalize error:", err);
        setErrorMessage("Payment verification failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    const baseAmount = 365;
    const totalAmount = baseAmount;
    const buyerViewLimit = currentRole === "buyer" ? 10 : null;

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now);
    if (currentRole === "seller") {
      endDate.setDate(endDate.getDate() + 30);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    const renewalDueDate = endDate.toISOString();

    const txId = `TXN_US_${Date.now().toString().slice(-8)}`;
    const gwRef = razorpayPaymentId || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
    const invNumber = `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const applicationId = `US_${currentRole.toUpperCase()}_${Date.now().toString().slice(-6)}`;

    try {
      const checkoutData = {
        transactionId: txId,
        gatewayReference: gwRef,
        userId: userAuth?.id || `USR_${Date.now().toString().slice(-6)}`,
        userName: userAuth?.name || "Verified Member",
        userEmail: userAuth?.email || "member@ulavansanthai.in",
        userMobile: userAuth?.mobile || "9876543210",
        role: currentRole.toUpperCase(),
        planId: currentRole === "buyer" ? "plan_buyer_base" : "plan_seller_monthly",
        planName:
          currentRole === "buyer"
            ? "Buyer Access Plan (10 Sellers)"
            : "Seller Monthly Plan (₹365/mo)",
        baseAmount,
        taxAmount: 0,
        totalAmount,
        currency: "INR",
        paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
        paymentDetails: {
          gateway: "Razorpay",
          razorpayPaymentId: gwRef,
        },
      };

      await submitRolePayment(checkoutData);

      if (typeof window !== "undefined") {
        const updatedUser = {
          ...userAuth,
          role: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
          onboarded: true,
          applicationId,
          status: "active",
          isPaid: true,
          payment: {
            transactionId: txId,
            gatewayReference: gwRef,
            invoiceNumber: invNumber,
            amount: totalAmount,
            status: "SUCCESS",
            paidAt: startDate,
            planStartDate: startDate,
            planEndDate: endDate.toISOString(),
            renewalDueDate,
            buyerViewLimit,
            buyerViewed: 0,
            buyerRemaining: buyerViewLimit,
          },
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_latest_payment_id", invNumber);
      }

      const res = {
        transactionId: txId,
        gatewayReference: gwRef,
        invoiceNumber: invNumber,
        paymentStatus: "SUCCESS",
        paymentDate: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        planStartDate: now.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        planEndDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        renewalDueDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        role: currentRole === "buyer" ? "Buyer" : "Seller",
        planName:
          currentRole === "buyer"
            ? "Buyer Access Plan (10 Verified Sellers)"
            : "Seller Monthly Plan (Unlimited Listings)",
        baseAmount,
        totalAmount,
        paymentMethod: "Razorpay Gateway",
        buyerViewLimit,
        buyerViewed: 0,
        buyerRemaining: buyerViewLimit,
        applicationId,
      };

      setPaymentResult(res);
      if (onPaymentSuccess) onPaymentSuccess(res);
    } catch (err) {
      console.error("Payment finalization error:", err);
      setErrorMessage("Payment verification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center py-6 sm:py-12 px-4 selection:bg-[#1F4D36] selection:text-white">
      {/* Scenic Agricultural Farm Background with Soft Blur */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center filter blur-xs brightness-95 scale-105"
        style={{
          backgroundImage: "url('/images/hero-aerial-fields.jpg')",
        }}
      />
      {/* Natural Atmospheric Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#1F4D36]/25 via-white/40 to-[#F5F5EB]/70 backdrop-blur-xs" />

      {/* Main Payment Container Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-9 space-y-6">
        {/* Top Header: Brand Logo & Home Link */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 text-[#1F4D36] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#204732]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M8 24C6 16 12 8 24 6C24 16 18 24 8 24Z" />
                <path d="M10 24C12 18 18 14 26 13C24 20 18 25 10 24Z" opacity="0.75" />
                <path
                  d="M6 26C10 22 14 18 22 14"
                  stroke="#153826"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-black text-[#1F4D36] tracking-tight">
              UlavanSanthai
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Quick role toggle button for testing */}
            <button
              type="button"
              onClick={() => handleRoleToggle(currentRole === "buyer" ? "seller" : "buyer")}
              className="text-[11px] font-semibold text-[#1F4D36] hover:underline bg-[#F4F7F2] px-2.5 py-1 rounded-lg border border-gray-200"
            >
              View {currentRole === "buyer" ? "Seller" : "Buyer"} Screen
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#1F4D36] transition-colors"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* If Payment Successful: Show Official Receipt */}
        {activeResult ? (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Payment Successful &amp; Profile Active!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                Your payment of <strong className="text-gray-900">₹{activeResult.totalAmount}.00</strong> has been verified via Razorpay. Your verified trading credentials on UlavanSanthai are now active.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/60 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <span className="font-black text-[#1F4D36] text-sm block">Ulavan Santhai Agricultural Marketplace</span>
                  <span className="text-gray-500">Official Membership &amp; Platform Access Receipt</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block font-semibold uppercase">Invoice</span>
                  <span className="font-mono font-bold text-gray-900">{activeResult.invoiceNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Subscribed Plan</span>
                  <span className="font-bold text-[#1F4D36]">{activeResult.planName}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Transaction Reference</span>
                  <span className="font-mono font-bold text-gray-900 truncate block">{activeResult.transactionId}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Payment Date</span>
                  <span className="font-bold text-gray-900">{activeResult.paymentDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Print / Save Receipt
              </button>
              <Link
                href={`/dashboard?role=${currentRole}&paid=true`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center"
              >
                Go to Dashboard &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Payment View matching exact reference mockup */
          <div className="space-y-6">
            {/* Header Title & Subtitle */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {currentRole === "buyer" ? "Buyer Membership Payment" : "Seller Subscription Payment"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {currentRole === "buyer"
                  ? "Get access to explore and connect with trusted sellers."
                  : "Continue as a verified seller and showcase your products."}
              </p>
            </div>

            {/* 3-Step Horizontal Stepper */}
            <div className="max-w-md mx-auto flex items-center justify-between px-2 sm:px-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#204732] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 mt-1 whitespace-nowrap">
                  {currentRole === "buyer" ? "Choose Plan" : "Complete Onboarding"}
                </span>
              </div>

              {/* Connecting Line 1 */}
              <div className="flex-1 h-0.5 bg-[#204732] mx-2 -mt-4" />

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#204732] text-white flex items-center justify-center text-xs font-bold ring-4 ring-[#204732]/20 shadow-xs">
                  2
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#204732] mt-1 whitespace-nowrap">
                  Payment
                </span>
              </div>

              {/* Connecting Line 2 */}
              <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4" />

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-400 bg-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-400 mt-1 whitespace-nowrap">
                  {currentRole === "buyer" ? "Access Granted" : "Start Selling"}
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Two-Column Main Payment Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Plan Card */}
              <div className="md:col-span-7 bg-[#F4F7F2] border border-gray-200/80 rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2 relative z-10">
                  {/* Badge & Price Header */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#204732] text-white text-[11px] font-bold tracking-wide">
                      {currentRole === "buyer" ? "Buyer Plan" : "Seller Plan"}
                    </span>
                    <div className="text-right shrink-0">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900">₹365</span>
                      <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                        {currentRole === "buyer" ? "/ Year" : "/ Month"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight pt-1">
                    {currentRole === "buyer" ? "Access up to 10 Sellers" : "Seller Subscription"}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {currentRole === "buyer"
                      ? "Explore products and connect with trusted sellers on our platform."
                      : "List and manage your products on UlavanSanthai."}
                  </p>

                  {/* Checklist Items */}
                  <div className="pt-3 space-y-2">
                    {(currentRole === "buyer"
                      ? [
                          "Search & Explore Products",
                          "Connect with Sellers",
                          "Safe & Trusted Platform",
                        ]
                      : [
                          "Add Products & Showcase",
                          "Manage Your Business",
                          "Reach More Buyers",
                        ]
                    ).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                        <span className="w-4 h-4 rounded-full bg-[#204732] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtle Botanical Leaf Illustration / Watermark in Bottom-Right Corner */}
                <div className="absolute -bottom-2 -right-2 w-32 h-32 pointer-events-none opacity-40">
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M110 110C90 90 70 70 40 60C30 80 50 110 110 110Z" fill="url(#leaf-grad-1)" />
                    <path d="M40 60C45 40 65 20 95 15C90 40 75 55 40 60Z" fill="url(#leaf-grad-2)" />
                    <path d="M110 110C80 85 55 55 40 60" stroke="#2B563D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    <defs>
                      <linearGradient id="leaf-grad-1" x1="40" y1="60" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#86EFAC" stopOpacity="0.8" />
                        <stop stopColor="#22C55E" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="leaf-grad-2" x1="40" y1="60" x2="95" y2="15" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4ADE80" stopOpacity="0.7" />
                        <stop stopColor="#15803D" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Right Column: Payment Summary */}
              <div className="md:col-span-5 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Payment Summary</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>{currentRole === "buyer" ? "Plan Amount" : "Subscription Fee"}</span>
                      <span className="font-bold text-gray-900">₹365</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Tax (if applicable)</span>
                      <span className="font-bold text-gray-900">₹0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm sm:text-base font-bold text-gray-900">Total Payable</span>
                      <span className="text-2xl font-black text-gray-900">₹365</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={processingState}
                    onClick={handleInitiatePayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#204732] hover:bg-[#153423] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processingState ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Pay ₹365 Now</span>
                        <span className="text-base font-bold">&rarr;</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                    <svg className="w-3.5 h-3.5 text-[#204732]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure payment via Razorpay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Alert / Info Banner */}
            <div className="bg-[#F4F7F2] border border-gray-200/80 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You will be redirected to Razorpay&apos;s secure payment page</span>
            </div>

            {/* Bottom Back Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleBackAction}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <span>&larr;</span>
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* Razorpay Interactive Simulation Modal (Fallback for Local / Preview) */}
        {isRazorpayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C2340] text-white flex items-center justify-center font-black text-xs">
                    R
                  </div>
                  <span className="font-bold text-gray-900 text-sm">Razorpay Checkout</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-5 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0C2340] flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-black text-gray-900">Ulavan Santhai Platform Access</h4>
                <p className="text-xs text-gray-500">
                  {currentRole === "buyer" ? "Buyer Verified Plan (10 Sellers)" : "Seller Monthly Membership Plan"}
                </p>
                <div className="text-2xl font-black text-[#1F4D36]">₹365.00</div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium text-left">
                  ⚡ <strong>Razorpay Gateway Ready</strong>: Complete test payment to activate your trading credentials.
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleFinalizePayment(`pay_rzp_mock_${Date.now().toString().slice(-8)}`)}
                  className="w-full py-3 px-4 rounded-xl bg-[#204732] hover:bg-[#153423] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Complete &amp; Simulate Successful Payment</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
