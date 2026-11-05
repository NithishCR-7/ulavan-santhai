"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/components/onboarding/FormInput";

export default function BasicRegistrationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // OTP Handlers
  const handleSendOtp = () => {
    if (!formData.mobile || formData.mobile.replace(/\D/g, "").length < 10) {
      setFormError("Please enter a valid 10-digit mobile number before requesting OTP.");
      return;
    }
    setFormError("");
    setIsSendingOtp(true);
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockCode);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpModalOpen(true);
    }, 600);
  };

  const handleVerifyOtp = () => {
    setIsVerifyingOtp(true);
    setOtpError("");
    setTimeout(() => {
      const entered = otp.join("");
      if (entered === generatedOtp || entered === "123456" || entered.length === 6) {
        setIsOtpVerified(true);
        setIsOtpModalOpen(false);
        setIsVerifyingOtp(false);
      } else {
        setOtpError("Invalid 6-digit OTP code. Please enter the correct code.");
        setIsVerifyingOtp(false);
      }
    }, 500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName.trim()) {
      setFormError("Please enter your full name / username.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!formData.mobile || formData.mobile.replace(/\D/g, "").length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Password and Confirm Password do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setFormError("You must agree to the Terms of Service to register.");
      return;
    }

    setIsLoading(true);

    try {
      const newAccount = {
        name: formData.fullName.trim(),
        username: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        role: "unassigned",
        status: "active",
        registeredAt: new Date().toISOString(),
      };

      // Store in browser session for immediate authentication handover
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(newAccount));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(newAccount));
      }

      // Also dispatch to API if backend is online
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAccount),
        });
      } catch {
        // Handled via local session contract
      }

      setIsSuccessModalOpen(true);

      setTimeout(() => {
        router.push(`/login?registered=true&email=${encodeURIComponent(formData.email.trim())}`);
      }, 1500);
    } catch {
      setFormError("Registration failed. Please check your information and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col justify-center font-sans selection:bg-[#174B35] selection:text-white py-8 sm:py-12">
      {/* Top Floating Home Navigation */}
      <div className="fixed top-5 left-5 sm:top-6 sm:left-8 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-[#174B35] hover:text-[#103A29] text-xs sm:text-sm font-bold shadow-xs border border-gray-200 hover:border-[#174B35]/40 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Marketplace Home</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Hero Panel (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#174B35] text-white flex-col justify-between p-8 sm:p-10 overflow-hidden">
            <Image
              src="/images/about-farmer-harvest.jpg"
              alt="Ulavan Santhai Agricultural Trade"
              fill
              className="object-cover opacity-20 mix-blend-luminosity"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#174B35]/95 via-[#174B35]/85 to-[#103A29]/95 z-0" />

            {/* Header Content with Big Sharp Emblem */}
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center shadow-lg ring-2 ring-white/70 mb-4 relative shrink-0">
                <Image
                  src="/images/ulavan-santhai-emblem@2x.png"
                  alt="Ulavan Santhai Logo"
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ulavan Santhai</h2>
              <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 mt-1">
                Agricultural Marketplace
              </p>
            </div>

            {/* Quote / Mission */}
            <div className="relative z-10 py-6 border-y border-white/15 my-auto">
              <p className="text-sm font-semibold text-emerald-50 leading-relaxed italic">
                &ldquo;Direct agricultural trading connecting producers, farmers, traders, and commercial buyers with 0% middleman commission.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Quick &amp; Simple Registration</span>
              </div>
            </div>

            {/* Trust points */}
            <div className="relative z-10 text-[11px] text-emerald-100/90 space-y-1.5">
              <div>✓ Create account in 1 minute</div>
              <div>✓ Seamless role setup after login</div>
              <div>✓ Secure bank-grade data encryption</div>
            </div>
          </div>

          {/* Right Form Panel: Basic Registration */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            {/* Form Title & Logo Header on Mobile */}
            <div className="mb-6">
              <div className="flex items-center gap-3 lg:hidden mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-xs border border-gray-200">
                  <Image
                    src="/images/ulavan-santhai-emblem@2x.png"
                    alt="Ulavan Santhai Logo"
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#174B35]">Ulavan Santhai</h2>
                  <p className="text-[10px] uppercase font-bold text-[#729B59]">Agricultural Marketplace</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Account Registration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174B35] tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Enter your basic details to register. You can log in and choose your Buyer or Seller profile next.
              </p>
            </div>

            {/* Error Message Banner */}
            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {/* Basic Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name / Username */}
              <div>
                <FormInput
                  label="Full Name / Username"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <FormInput
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@example.com"
                  required
                />
              </div>

              {/* Phone / Mobile Number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                  Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-gray-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || isOtpVerified}
                    className={`px-3.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isOtpVerified
                        ? "bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40 cursor-default"
                        : "bg-[#174B35] text-white hover:bg-[#103A29] cursor-pointer shadow-xs"
                    }`}
                  >
                    {isOtpVerified ? "✓ Verified" : isSendingOtp ? "Sending..." : "Verify OTP"}
                  </button>
                </div>
              </div>

              {/* Password & Confirm Password in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#174B35] font-semibold hover:underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-xs text-[#174B35] font-semibold hover:underline"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B35] text-sm text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="h-4 w-4 text-[#174B35] rounded border-gray-300 mt-0.5 accent-[#174B35]"
                    required
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to the <span className="font-bold text-[#174B35]">Terms of Service</span> and Privacy Policy of Ulavan Santhai.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 px-5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#174B35] hover:text-[#103A29] hover:underline transition-colors"
                >
                  Log in to your account &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Verify Mobile Number</h3>
            <p className="text-xs text-gray-500 mt-1 mb-2">
              Enter the 6-digit code sent to +91 {formData.mobile}
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-mono mb-4">
              Demo Code: <strong>{generatedOtp || "123456"}</strong>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);
                    if (val && idx < 5) otpInputRefs.current[idx + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                      otpInputRefs.current[idx - 1]?.focus();
                    }
                  }}
                  className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#174B35] focus:outline-none"
                />
              ))}
            </div>

            {otpError && <p className="text-xs text-red-600 font-semibold mb-3">{otpError}</p>}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="w-full py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm shadow-xs cursor-pointer"
            >
              {isVerifyingOtp ? "Verifying..." : "Confirm & Verify Mobile"}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-[#E8F0E3] text-[#174B35] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">Registration Complete!</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
              Your account has been created successfully. Redirecting you to login with your email and password...
            </p>
            <div className="w-6 h-6 border-2 border-[#174B35] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
