"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [isLiveVideo, setIsLiveVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // User uploaded authentic aerial photograph of lush green paddy fields and river at golden hour (Thanjavur, Tamil Nadu)
  const heroImageSrc = "/images/hero-aerial-fields.jpg";

  // Genuine high-quality agricultural footage (Wikimedia Commons / USDA NRCS)
  const videoWebm =
    "https://upload.wikimedia.org/wikipedia/commons/4/46/20200724-NRCS-LSC-0030-Rice_Harvesting.webm";
  const videoWebmAlt =
    "https://upload.wikimedia.org/wikipedia/commons/f/f6/Tea_Garden_view_near_Jalpaiguri%2C_North_West_Bengal.webm";

  return (
    <section
      id="hero"
      className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden bg-[#103A29]"
    >
      {/* Background Visual Layer */}
      <div className="absolute inset-0 w-full h-full">
        {/* High-Resolution Aerial Photograph (User Selected) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            isLiveVideo && videoLoaded ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={heroImageSrc}
            alt="Aerial view of lush green agricultural paddy fields and river at golden hour"
            fill
            priority
            quality={92}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Cinematic Agricultural Video Background (Toggleable / Optional) */}
        {isLiveVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={videoWebm} type="video/webm" />
            <source src={videoWebmAlt} type="video/webm" />
          </video>
        )}

        {/* Directional Gradient Scrim:
            - Left side: Soft forest green gradient providing perfect contrast for white typography
            - Right side: Completely clear and transparent, keeping the vibrant green landscape and daylight visible */}
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

      {/* Interactive View Switcher: Aerial Photograph / Cinematic Reel */}
      <div className="absolute bottom-6 right-6 sm:right-8 z-20 flex items-center gap-1.5 bg-[#103A29]/80 backdrop-blur-md border border-white/20 p-1 rounded-full text-xs font-semibold text-white/90 shadow-md">
        <button
          type="button"
          onClick={() => setIsLiveVideo(false)}
          className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            !isLiveVideo
              ? "bg-white text-[#174B35] shadow-xs"
              : "text-white/80 hover:text-white"
          }`}
          aria-label="View Aerial Fields Photography"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Aerial View</span>
        </button>
        <button
          type="button"
          onClick={() => setIsLiveVideo(true)}
          className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            isLiveVideo
              ? "bg-white text-[#174B35] shadow-xs"
              : "text-white/80 hover:text-white"
          }`}
          aria-label="Play Cinematic Video Reel"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Cinematic Reel</span>
        </button>
      </div>
    </section>
  );
}
