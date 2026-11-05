"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS, submitRolePayment } from "@/services/paymentApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function OnboardingPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading checkout plan...
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}

function PaymentCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useSessionUser();

  const roleParam = (searchParams.get("role") || "buyer").toLowerCase();
  const isSecondRole = searchParams.get("mode") === "add_second_role";
  const activeRole = roleParam === "seller" ? "SELLER" : "BUYER";
  const plan = PRICING_PLANS[activeRole] || PRICING_PLANS.BUYER;

  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiVpa, setUpiVpa] = useState("farmer.uzhavan@okhdfcbank");
  const [upiApp, setUpiApp] = useState("GPAY"); // 'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM'

  // Card fields
  const [cardHolder, setCardHolder] = useState(sessionUser?.name || "Ramesh Kumar");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8812");
  const [cardExpiry, setCardExpiry] = useState("09/28");
  const [cardCvv, setCardCvv] = useState("789");

  // Net banking field
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Submission State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [confirmedPayment, setConfirmedPayment] = useState(null);

  const handleProcessPayment = async (simulateFail = false) => {
    setPaymentError("");
    setIsProcessing(true);

    if (simulateFail) {
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentError(
          "Payment authorization failed: The simulated bank gateway declined the transaction. Your registration and role selection remain intact. Please retry."
        );
      }, 1200);
      return;
    }

    try {
      const checkoutPayload = {
        role: activeRole,
        userId: sessionUser?.id || sessionUser?.applicationId || `USR_${Date.now().toString().slice(-6)}`,
        userName: sessionUser?.name || "Verified Member",
        userEmail: sessionUser?.email || "user@ulavansanthai.in",
        userMobile: sessionUser?.mobile || "9876543210",
        paymentMethod: paymentMethod,
        paymentDetails:
          paymentMethod === "UPI"
            ? { upiVpa, upiApp }
            : paymentMethod === "CARD"
            ? { cardHolder, cardLast4: "8812" }
            : { bank: selectedBank },
      };

      const res = await submitRolePayment(checkoutPayload);

      if (res.success && res.data) {
        setConfirmedPayment(res.data);
      } else {
        setPaymentError(res.error || "Payment processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("Network error contacting payment gateway. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Brand Header */}
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
              <span className="text-xl sm:text-2xl font-black text-[#174B35] tracking-tight leading-tight">
                Ulavan Santhai
              </span>
              <span className="text-[11px] tracking-wider uppercase font-extrabold text-[#729B59]">
                Agricultural Marketplace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">
              {isSecondRole ? "Activating Second Role" : "Initial Registration"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-extrabold">
              {activeRole} Plan
            </span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-6">
        {/* Onboarding Journey Stepper Indicator */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 overflow-x-auto gap-2 pb-1">
            <div className="flex items-center gap-1.5 text-emerald-700 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black">✓</span>
              <span>1. Account</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5 text-emerald-700 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black">✓</span>
              <span>2. Verified</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5 text-emerald-700 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black">✓</span>
              <span>3. Role: {activeRole}</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5 text-[#174B35] font-black shrink-0 bg-[#E8F0E3] px-2.5 py-1 rounded-full border border-[#729B59]/40">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>4. Membership Payment</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <span>5. Admin Review</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <span>6. Onboarding</span>
            </div>
          </div>
        </div>

        {confirmedPayment ? (
          /* Payment Success Confirmation Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-2xs text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#174B35] flex items-center justify-center mx-auto text-3xl font-black">
              ✓
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#729B59] bg-[#E8F0E3] px-3.5 py-1 rounded-full">
                Payment Processed &bull; Review Queued
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                ₹{confirmedPayment.totalAmount} Payment Received!
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-lg mx-auto">
                Thank you for subscribing to the <strong>{confirmedPayment.planName}</strong>. As required by UlavanSanthai fair-trade policy, all new payments are reviewed by our verification officer before account activation.
              </p>
            </div>

            {/* Transaction Receipt Box */}
            <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-[#F5F5EB] border border-gray-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900">{confirmedPayment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway Reference:</span>
                <span className="font-mono font-bold text-gray-900">{confirmedPayment.gatewayReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-mono font-bold text-gray-900">{confirmedPayment.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-[#174B35]">₹{confirmedPayment.totalAmount} (All Inclusive)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⏳ Pending Admin Verification
                </span>
              </div>
            </div>

            {/* Next Steps Guidance */}
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-900">
              <span className="font-bold block mb-0.5">What Happens Next?</span>
              <p className="text-emerald-800 leading-relaxed">
                Your payment reference has been added to the administrative review queue. Once approved by our team, you will proceed directly to detailed business profile setup and document upload.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                href={`/onboarding/status?role=${roleParam}&paymentId=${confirmedPayment.id}`}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-colors text-center"
              >
                Track Payment Review Status &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Checkout Form */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Plan Benefits & Price Summary (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider">
                  <span>Selected Role: {activeRole}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {plan.name}
                </h2>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {plan.description}
                </p>

                {/* Pricing Big Badge */}
                <div className="p-4 rounded-2xl bg-[#F5F5EB] border border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold uppercase block">
                      Platform Fee
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-[#174B35]">₹{plan.totalAmount}</span>
                      <span className="text-xs font-bold text-gray-500">/ {plan.billingCycle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                    0% Commission
                  </span>
                </div>

                {/* Plan Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700 block">Plan Inclusions:</span>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {plan.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#174B35] font-black shrink-0">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-[11px] text-gray-400 border-t border-gray-100">
                  ℹ️ <em>Payment is required immediately after role selection before entering detailed business credentials.</em>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Gateway Methods & Checkout (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="text-lg font-black text-gray-900">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    100% secure agricultural payment gateway (UPI, Cards, Net Banking)
                  </p>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "UPI", label: "UPI Apps / QR", icon: "📱" },
                    { id: "CARD", label: "Cards", icon: "💳" },
                    { id: "NETBANKING", label: "Net Banking", icon: "🏛️" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? "bg-[#E8F0E3] border-[#174B35] text-[#174B35] font-bold shadow-2xs"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base block mb-0.5">{m.icon}</span>
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Error Banner */}
                {paymentError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in fade-in duration-150">
                    {paymentError}
                  </div>
                )}

                {/* Method 1: UPI */}
                {paymentMethod === "UPI" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Choose UPI App / Method
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {["GPAY", "PHONEPE", "PAYTM", "BHIM"].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setUpiApp(app)}
                            className={`p-2 rounded-xl border text-center font-bold cursor-pointer ${
                              upiApp === app
                                ? "bg-white border-[#174B35] text-[#174B35] shadow-xs"
                                : "bg-white/60 border-gray-200 text-gray-600"
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        A payment collect request of ₹365 will be authorized on your UPI app.
                      </span>
                    </div>
                  </div>
                )}

                {/* Method 2: Cards */}
                {paymentMethod === "CARD" && (
                  <div className="space-y-3.5 p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Net Banking */}
                {paymentMethod === "NETBANKING" && (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#F5F5EB]/60 border border-gray-200/80 text-xs">
                    <label className="block font-bold text-gray-700 mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="INDIAN_BANK">Indian Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KVB">Karur Vysya Bank (KVB)</option>
                    </select>
                    <span className="text-[11px] text-gray-400 block">
                      You will be redirected to the bank&apos;s secure portal to authorize the ₹365 fee.
                    </span>
                  </div>
                )}

                {/* Amount Due Breakdown */}
                <div className="pt-2 border-t border-gray-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-500">
                    <span>Base Membership Fee:</span>
                    <span>₹{plan.basePrice}.00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Applicable GST / Taxes:</span>
                    <span className="text-emerald-700 font-bold">₹0.00 (Exempt / Inclusive)</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total Amount Payable:</span>
                    <span className="text-[#174B35]">₹{plan.totalAmount}.00</span>
                  </div>
                </div>

                {/* Pay Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleProcessPayment(false)}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white font-black text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Authorizing ₹{plan.totalAmount} with Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>🔒 Pay ₹{plan.totalAmount} Securely</span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>

                  {/* Testing Failure Recovery Flow */}
                  <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400">
                    <span>256-bit SSL Encrypted Transaction</span>
                    <button
                      type="button"
                      onClick={() => handleProcessPayment(true)}
                      className="text-gray-400 hover:text-red-600 hover:underline cursor-pointer"
                      title="Test gateway rejection and failure retry path"
                    >
                      [Test Gateway Failure Simulation]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

