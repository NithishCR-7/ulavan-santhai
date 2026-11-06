"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";

export default function HeroSection() {
  const videoRef = useRef(null);

  // Background video & matching first-frame poster
  const videoSrc = "/Rice_stalks_swaying_in_breeze_dda964d8_1080p.mp4";
  const posterSrc = "/images/hero-video-poster.jpg";

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback silently to poster if autoplay is restricted
      });
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full h-[100svh] min-h-[100svh] flex items-center overflow-hidden bg-black m-0 p-0"
    >
      {/* 1. Edge-to-Edge Cinematic Background Video Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={posterSrc}
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] sm:object-[center_30%] scale-[1.02] transform-gpu pointer-events-none"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Directional scrim: Toned-down natural dark gradient ensuring crisp typography without heavy green wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 via-50% to-transparent pointer-events-none" />

        {/* Mobile vertical gradient: clean natural contrast */}
        <div className="sm:hidden absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top subtle scrim for navbar clarity */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* 2. Hero Content: Editorial Left-Aligned Responsive Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 sm:pt-24 pb-12">
        <div className="max-w-2xl text-left">
          {/* Small Introductory Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/95 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
            <span>Connecting Agriculture. Creating Opportunities.</span>
          </div>

          {/* Main Heading: Plus Jakarta Sans display typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] sm:leading-[1.15] drop-shadow-md font-display">
            Growing Together. <br />
            <span className="text-white/95">Trading Better.</span>
          </h1>

          {/* Supporting Description */}
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed font-normal drop-shadow-md font-sans">
            One marketplace connecting farmers, suppliers and bulk buyers.
            Discover agricultural products, showcase your produce and build
            valuable business connections.
          </p>

          {/* Action Buttons: Stacked on small screens, side-by-side on tablet/desktop */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
            <a
              href="#categories"
              className="h-12 px-7 rounded-full bg-white hover:bg-[#F5F5EB] text-[#15220D] font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] text-center"
            >
              Explore Marketplace
            </a>
            <Link
              href="/get-started"
              className="h-12 px-7 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/40 font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] text-center backdrop-blur-xs"
            >
              Join Ulavan Santhai
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
