"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";

export default function GetStartedPage() {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const userName =
    sessionUser?.name && sessionUser.name !== "Farmer Ramesh Kumar"
      ? sessionUser.name
      : "";

  const isBuyerOnboarded =
    sessionUser?.isPaid &&
    (sessionUser?.buyerData !== null || sessionUser?.role?.toLowerCase() === "buyer");

  const isSellerOnboarded =
    sessionUser?.isPaid &&
    (sessionUser?.sellerData !== null || sessionUser?.role?.toLowerCase() === "seller");

  const handleSelectRole = (role, forceOnboard = false) => {
    try {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      let currentUser = stored ? JSON.parse(stored) : {};

      const roleCapitalized = role === "buyer" ? "Buyer" : "Seller";
      currentUser.role = roleCapitalized;
      currentUser.activeRole = role;

      sessionStorage.setItem("ulavan_user", JSON.stringify(currentUser));
      sessionStorage.setItem("ulavan_registered_user", JSON.stringify(currentUser));
      localStorage.setItem("ulavan_registered_user", JSON.stringify(currentUser));

      const isRolePaid =
        currentUser.isPaid &&
        (role === "buyer"
          ? currentUser.buyerData || currentUser.role === "Buyer"
          : currentUser.sellerData || currentUser.role === "Seller");

      if (isRolePaid && !forceOnboard) {
        if (role === "seller") {
          router.push("/seller/dashboard");
        } else {
          router.push("/dashboard?role=buyer");
        }
      } else {
        router.push(`/onboarding?role=${role}`);
      }
    } catch {
      router.push(`/onboarding?role=${role}`);
    }
  };

  const cards = [
    {
      role: "buyer",
      title: "Buyer",
      tagline:
        "For commercial traders, retailers, restaurants, food processors, and wholesale buyers.",
      badge: "Sourcing & Procurement",
      image: "/images/get-started/buyer-wholesale.jpg",
      alt: "Wholesale APMC agriculture mandi with buyers inspecting crates of fresh produce",
      benefits: [
        "Find verified agricultural products.",
        "Discover direct farm producers.",
        "Connect directly with suppliers.",
      ],
      isOnboarded: isBuyerOnboarded,
      buttonText: isBuyerOnboarded ? "Open Buyer Workspace" : "Continue as Buyer",
      buttonBg: "bg-[#174B35] hover:bg-[#103A29] text-white",
      borderAccent: "hover:border-[#174B35]",
    },
    {
      role: "seller",
      title: "Seller",
      tagline:
        "For farmers, FPOs, organic producers, plantation growers, and agri-processors.",
      badge: "Producers & Farmers",
      image: "/images/get-started/seller-farmer.jpg",
      alt: "Smiling Indian farmer in paddy field holding freshly harvested crops",
      benefits: [
        "Showcase your agricultural crops & harvest.",
        "Connect directly with bulk verified buyers.",
        "Receive direct farm-gate payments.",
      ],
      isOnboarded: isSellerOnboarded,
      popularBadge: isSellerOnboarded ? "Active Plan" : "Direct Farm Gate",
      buttonText: isSellerOnboarded ? "Open Seller Workspace" : "Continue as Seller",
      buttonBg: "bg-[#174B35] hover:bg-[#103A29] text-white",
      borderAccent: "hover:border-[#174B35]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Top Brand Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with 2x sharp emblem */}
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

          {/* Quick Links */}
          <div className="flex items-center gap-4">
            {userName ? (
              <div
                suppressHydrationWarning
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Signed in as: <strong className="text-[#174B35]">{userName}</strong>
                </span>
              </div>
            ) : (
              <span className="hidden sm:inline text-xs text-gray-500 font-medium">
                Already have an account?
              </span>
            )}
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#174B35] border border-[#174B35]/30 hover:bg-[#E8F0E3] transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold tracking-wide uppercase mb-4 border border-[#729B59]/30">
            <span className="w-2 h-2 rounded-full bg-[#729B59]" />
            <span>Step 2: Choose Your Marketplace Role</span>
          </div>
          <h1
            suppressHydrationWarning
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#174B35] tracking-tight leading-tight"
          >
            {userName ? `Welcome back, ${userName}!` : "Choose Your Marketplace Role"}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Switch between your Buyer and Seller workspaces anytime, or complete your tailored profile to start trading with zero middleman margin.
          </p>
        </div>

        {/* 2 Large Image Cards Grid: Buyer and Seller */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto w-full gap-8 items-stretch">
          {cards.map((card) => (
            <div
              key={card.role}
              onClick={() => handleSelectRole(card.role)}
              className={`group bg-white rounded-3xl overflow-hidden border-2 border-gray-200/90 shadow-sm hover:shadow-2xl ${card.borderAccent} transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1.5 relative`}
            >
              {/* Active Plan / Popular Badge */}
              {card.isOnboarded ? (
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Verified Plan Active
                  </span>
                </div>
              ) : card.popularBadge ? (
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#174B35] text-white text-[11px] font-bold shadow-md tracking-wide">
                    {card.popularBadge}
                  </span>
                </div>
              ) : null}

              {/* Large Image Header */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                    {card.badge}
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed min-h-[38px]">
                    {card.tagline}
                  </p>

                  <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                    {card.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole(card.role);
                    }}
                    className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-sm group-hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${card.buttonBg}`}
                  >
                    <span>{card.buttonText}</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>

                  {card.isOnboarded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRole(card.role, true);
                      }}
                      className="w-full text-center text-xs font-semibold text-gray-500 hover:text-[#174B35] py-1 cursor-pointer hover:underline transition-colors"
                    >
                      Edit {card.title} Details / Re-fill Form
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
