"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { id: "home", name: "Home", href: "/#hero" },
    { id: "who-its-for", name: "Who it’s for", href: "/#who-its-for" },
    { id: "how-it-works", name: "How it works", href: "/#how-it-works" },
    { id: "plans", name: "Plans", href: "/#plans" },
  ];

  // Track scroll position for background state and active navigation item
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      const scrollPos = scrollY + 220;
      const sections = ["hero", "who-its-for", "how-it-works", "plans", "contact"];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId === "hero" ? "home" : sectionId);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-neutral-200/80 shadow-xs"
          : "bg-transparent border-b border-transparent shadow-none"
      }`}
    >
      {/* Main Navbar Bar: Preserves consistent dimensions & alignment across both states */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* 1. Left: Brand Text - Transitions from White (top) to Dark Green #06452C (scrolled) */}
        <div className="flex items-center justify-start shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5F340] rounded-lg"
          >
            <span
              className={`text-base sm:text-xl lg:text-2xl font-black tracking-tight uppercase font-display whitespace-nowrap transition-colors duration-300 ${
                isScrolled ? "text-[#06452C]" : "text-white drop-shadow-sm"
              }`}
            >
              Ulavan Santhai
            </span>
          </Link>
        </div>

        {/* 2. Center: Compact Dark Forest-Green Pill (#063D22) with Lime-Green Active Item (#C5F340) */}
        <div className="hidden lg:flex items-center justify-center mx-4">
          <nav
            aria-label="Main Navigation"
            className="h-[46px] inline-flex items-center bg-[#063D22] border border-[#063D22]/90 rounded-full p-1 shadow-md shadow-black/15"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setActiveSection(link.id)}
                  className={`h-full inline-flex items-center justify-center px-5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5F340] ${
                    isActive
                      ? "bg-[#C5F340] text-[#15220D] shadow-xs font-bold"
                      : "text-[#E8EDE5] hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* 3. Right: Desktop Lime-Green "Contact Us" Button + Mobile Compact Menu Button */}
        <div className="flex items-center justify-end shrink-0">
          {/* Desktop Contact Us Button */}
          <Link
            href="/#contact"
            className="hidden lg:inline-flex h-[48px] items-center gap-3 pl-5 sm:pl-6 pr-2 rounded-full bg-[#C5F340] hover:bg-[#b8e833] text-[#15220D] text-sm sm:text-base font-bold shadow-md shadow-black/15 transition-all duration-200 group active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#06452C] shrink-0"
          >
            <span className="tracking-tight">Contact Us</span>

            {/* Black circular badge with white diagonal arrow */}
            <div className="w-[34px] h-[34px] rounded-full bg-[#050805] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg
                className="w-4 h-4 stroke-[2.5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17L17 7M17 7H9M17 7V15"
                />
              </svg>
            </div>
          </Link>

          {/* Mobile & Tablet Compact Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#063D22] text-[#C5F340] hover:bg-[#C5F340] hover:text-[#15220D] border border-[#C5F340]/50 shadow-md shadow-black/20 flex items-center justify-center transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5F340] shrink-0 active:scale-95"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="bg-[#063D22]/98 backdrop-blur-xl rounded-3xl border border-[#063D22]/80 shadow-2xl p-5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-3 px-5 rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#C5F340] text-[#15220D] font-bold"
                      : "text-[#E8EDE5] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}

            <div className="pt-3 mt-1 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-5 rounded-full text-center text-sm font-semibold text-[#E8EDE5] hover:text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="h-[48px] px-6 rounded-full bg-[#C5F340] hover:bg-[#b8e833] text-[#15220D] text-sm font-bold flex items-center justify-center gap-3 shadow-md shadow-black/20 transition-all duration-200"
              >
                <span>Contact Us</span>
                <div className="w-[30px] h-[30px] rounded-full bg-[#050805] text-white flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
