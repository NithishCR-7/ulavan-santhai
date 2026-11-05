"use client";

import Image from "next/image";
import Link from "next/link";
import { useSessionUser } from "@/services/sessionAuth";

export default function MarketplaceHeader() {
  const sessionUser = useSessionUser();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-xs border border-gray-200 group-hover:scale-105 transition-transform">
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
            <span className="text-lg sm:text-xl font-black text-[#174B35] tracking-tight leading-tight">
              Ulavan Santhai
            </span>
            <span className="text-[10px] uppercase font-bold text-[#729B59] tracking-wider">
              Agricultural Marketplace
            </span>
          </div>
        </Link>

        {/* Center Navigation Links on Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-gray-600">
          <Link href="/" className="hover:text-[#174B35] transition-colors">
            Home
          </Link>
          <Link
            href="/marketplace"
            className="text-[#174B35] font-extrabold flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Explore Products</span>
          </Link>
          <Link href="/dashboard" className="hover:text-[#174B35] transition-colors">
            Buyer Dashboard
          </Link>
          <Link href="/buyer/enquiries" className="hover:text-[#174B35] transition-colors">
            My Enquiries
          </Link>
          <Link href="/seller/dashboard" className="hover:text-[#174B35] transition-colors">
            Seller Workspace
          </Link>
          <Link href="/admin/payments" className="text-gray-400 hover:text-red-700 transition-colors text-xs font-semibold">
            Admin
          </Link>
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {sessionUser ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold text-xs shadow-2xs border border-[#729B59]/30">
                {sessionUser.name ? sessionUser.name.charAt(0).toUpperCase() : "B"}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {sessionUser.name || "Buyer"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Verified Buyer
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#174B35] hover:bg-[#F5F5EB] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

