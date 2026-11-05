"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "About", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Categories", href: "#categories" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs py-3 border-b border-gray-100"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo on the Left */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 relative shrink-0 shadow-md ${
              isScrolled
                ? "ring-2 ring-[#174B35]/25 bg-[#F5F5EB]"
                : "ring-2 ring-white/80 bg-[#F5F5EB]"
            }`}
          >
            <Image
              src="/images/ulavan-santhai-emblem@2x.png"
              alt="Ulavan Santhai Logo"
              fill
              sizes="(max-width: 640px) 48px, 52px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight leading-tight transition-colors duration-300 ${
                isScrolled ? "text-[#174B35]" : "text-white drop-shadow-sm"
              }`}
            >
              Ulavan Santhai
            </span>
            <span
              className={`text-[10px] sm:text-[11px] tracking-wider uppercase font-bold transition-colors duration-300 ${
                isScrolled ? "text-[#729B59]" : "text-[#E8F0E3] drop-shadow-xs"
              }`}
            >
              Agricultural Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium tracking-normal transition-colors duration-200 hover:text-[#729B59] ${
                isScrolled
                  ? "text-[#263329]"
                  : "text-white/90 hover:text-white drop-shadow-xs"
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions: Dashboard, Login & Register */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              isScrolled
                ? "text-[#174B35] hover:bg-[#E8F0E3]/60"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              isScrolled
                ? "text-[#174B35] hover:bg-[#E8F0E3]/60"
                : "text-white/95 hover:text-white hover:bg-white/10"
            }`}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98] ${
              isScrolled
                ? "bg-[#174B35] text-white hover:bg-[#103A29]"
                : "bg-white text-[#174B35] hover:bg-[#F5F5EB]"
            }`}
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isScrolled
                ? "text-[#263329] hover:bg-gray-100"
                : "text-white hover:bg-white/15"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-xl px-5 pt-3 pb-6 mt-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#263329] hover:text-[#174B35] font-semibold text-base py-2 border-b border-gray-50"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-[#174B35] border border-[#174B35]/30 rounded-xl hover:bg-[#E8F0E3]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 text-sm font-bold text-white bg-[#174B35] rounded-xl hover:bg-[#103A29] shadow-md shadow-emerald-950/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
