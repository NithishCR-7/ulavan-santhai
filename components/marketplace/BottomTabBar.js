"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function BottomTabBar(props) {
  return (
    <Suspense fallback={<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 h-14" />}>
      <BottomTabBarContent {...props} />
    </Suspense>
  );
}

function BottomTabBarContent({
  savedCount = 0,
  enquiryCount = 0,
  onOpenCategories,
  onOpenAccount,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const isHome = pathname === "/marketplace" && !currentView && !searchParams.get("category");
  const isCategories = currentView === "categories" || !!searchParams.get("category");
  const isEnquiries = pathname === "/buyer/enquiries" || pathname === "/marketplace/enquiries";
  const isSaved = pathname === "/marketplace/saved" || currentView === "saved";
  const isAccount = currentView === "profile" || currentView === "access";

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around text-[10px] font-bold">
      {/* 1. Home */}
      <Link
        href="/marketplace"
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          isHome ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isHome ? 2.5 : 2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="mt-0.5">Home</span>
      </Link>

      {/* 2. Categories */}
      {onOpenCategories ? (
        <button
          type="button"
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer ${
            isCategories ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isCategories ? 2.5 : 2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="mt-0.5">Categories</span>
        </button>
      ) : (
        <Link
          href="/marketplace?view=explore"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
            isCategories ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isCategories ? 2.5 : 2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="mt-0.5">Categories</span>
        </Link>
      )}

      {/* 3. Enquiries */}
      <Link
        href="/buyer/enquiries"
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          isEnquiries ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isEnquiries ? 2.5 : 2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {enquiryCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
              {enquiryCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">Enquiries</span>
      </Link>

      {/* 4. Saved */}
      <Link
        href="/marketplace/saved"
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          isSaved ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isSaved ? 2.5 : 2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#174B35] text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">Saved</span>
      </Link>

      {/* 5. Account */}
      {onOpenAccount ? (
        <button
          type="button"
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer ${
            isAccount ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isAccount ? 2.5 : 2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="mt-0.5">Account</span>
        </button>
      ) : (
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
            isAccount ? "text-[#174B35]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isAccount ? 2.5 : 2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="mt-0.5">Account</span>
        </Link>
      )}
    </nav>
  );
}
