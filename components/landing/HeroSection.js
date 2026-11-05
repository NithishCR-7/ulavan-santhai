"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // Background video: Rice stalks swaying in breeze
  const videoSrc = "/Rice_stalks_swaying_in_breeze_dda964d8_1080p.mp4";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden bg-[#103A29]"
    >
      {/* Background Visual Layer */}
      <div className="absolute inset-0 w-full h-full">
        {/* Full-bleed Rice stalks swaying video as background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Directional Gradient Scrim:
            - Left side: Soft forest green gradient providing perfect contrast for white typography
            - Right side: Clear gradient keeping the swaying rice stalks visible and vibrant */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#103A29]/95 via-[#103A29]/65 via-45% to-transparent pointer-events-none" />

        {/* Mobile vertical gradient (balanced for smaller portrait screens) */}
        <div className="sm:hidden absolute inset-0 bg-gradient-to-b from-[#103A29]/90 via-[#103A29]/60 to-[#103A29]/80 pointer-events-none" />

        {/* Top subtle scrim for navigation bar clarity */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content: Balanced Editorial Left-Aligned Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 sm:py-36">
        <div className="max-w-2xl text-left">
          {/* Small Introductory Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#E8F0E3] text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#729B59] animate-pulse" />
            <span>Connecting Agriculture. Creating Opportunities.</span>
          </div>

          {/* Main Heading: Large and Elegant, Perfectly Proportioned */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight lg:leading-[1.18] drop-shadow-sm">
            Growing Together. <br />
            <span className="text-[#E8F0E3]">Trading Better.</span>
          </h1>

          {/* Supporting Description: Controlled Width and Comfortable Line Height */}
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed font-normal drop-shadow-xs">
            One marketplace connecting farmers, suppliers and bulk buyers.
            Discover agricultural products, showcase your produce and build
            valuable business connections.
          </p>

          {/* Two Visually Distinct Buttons with Matching Heights and Clean Transitions */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
            <a
              href="#categories"
              className="h-12 px-7 rounded-xl bg-white hover:bg-[#F5F5EB] text-[#174B35] font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] text-center"
            >
              Explore Marketplace
            </a>
            <Link
              href="/register"
              className="h-12 px-7 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white border border-white/30 font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] text-center"
            >
              Join Ulavan Santhai
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Cue at the Bottom Left */}
      <a
        href="#about"
        className="hidden sm:flex absolute bottom-6 left-8 text-white/70 hover:text-white transition-colors duration-200 items-center gap-2 z-10 text-xs font-medium tracking-wide uppercase"
        aria-label="Scroll down to About section"
      >
        <span>Discover Platform</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      {/* Video Motion Control Toggle */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background video" : "Play background video"}
        className="absolute bottom-6 right-6 sm:right-8 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#103A29]/80 hover:bg-[#103A29] backdrop-blur-md border border-white/20 text-xs font-semibold text-white/90 shadow-md transition-all duration-200 cursor-pointer"
      >
        {isPlaying ? (
          <>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>Pause Motion</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play Motion</span>
          </>
        )}
      </button>
    </section>
  );
}
