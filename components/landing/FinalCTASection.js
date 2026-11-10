"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getMotionSnapshot = () => window.matchMedia(motionQuery).matches;
const getServerMotionSnapshot = () => true;

export default function FinalCTASection() {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getServerMotionSnapshot);

  // Harvesting video asset (local high-speed copy with Wikimedia Commons fallback)
  const videoLocal = "/harvester-rice-harvest.webm";
  const videoWebm =
    "https://upload.wikimedia.org/wikipedia/commons/d/d9/20200724-NRCS-LSC-0028-Rice_Harvest.webm";
  const posterImage = "/images/harvester-video-poster.jpg";

  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [prefersReducedMotion]);

  return (
    <div className="w-full bg-[#f5f5eb] m-0 p-0 border-none">
      <style>{`
        @media (max-width: 640px) {
          #final-cta {
            border-radius: clamp(36px, 8vw, 48px) clamp(36px, 8vw, 48px) 0 0 !important;
          }
        }
      `}</style>
      <section
        id="final-cta"
        className="relative w-full overflow-hidden bg-[#001f2b] text-white m-0 border-none select-none"
        style={{
          borderRadius: "clamp(56px, 8vw, 150px) clamp(56px, 8vw, 150px) 0 0",
        }}
        aria-labelledby="final-cta-heading"
      >
      {/* 1. Full-Coverage Agricultural Harvesting Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterImage}
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover object-[center_35%] sm:object-[center_30%] scale-[1.02] transform-gpu transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-90"
            }`}
          >
            <source src={videoLocal} type="video/webm" />
            <source src={videoWebm} type="video/webm" />
            {/* Fallback image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterImage}
              alt="Agricultural combine harvester working in lush green field"
              className="w-full h-full object-cover object-[center_35%]"
            />
          </video>
        )}

        {/* If user prefers reduced motion, render high-res poster only */}
        {prefersReducedMotion && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterImage}
            alt="Agricultural combine harvester working in lush green field"
            className="w-full h-full object-cover object-[center_35%]"
          />
        )}

        {/* One balanced scrim keeps the footage visible and the text readable. */}
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(180deg, rgba(0,31,43,.42), rgba(0,31,43,.52) 55%, rgba(0,31,43,.65))"}} />
      </div>

      {/* 3. Centered Editorial Content Flow */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-14 md:py-16 text-center flex flex-col items-center justify-center">
        {/* Main Heading: Plus Jakarta Sans display typography */}
        <h2
          id="final-cta-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.2] font-display max-w-3xl drop-shadow-md"
        >
          Be Part of a Growing <br className="hidden sm:inline" />
          Agricultural Community.
        </h2>

        {/* Supporting Description */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-[#dce9e6] max-w-2xl leading-relaxed font-sans drop-shadow-xs">
          Join Ulavan Santhai and create new opportunities through agricultural
          connections.
        </p>

        {/* Action Buttons: Lime-green Primary + Outlined Secondary */}
        <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          {/* Lime-green Primary "Join Now" */}
          <Link
            href="/register"
            className="h-12 px-7 rounded-xl bg-[#c5f340] hover:bg-[#d4ff62] text-[#10251b] font-bold text-sm sm:text-base inline-flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-md active:scale-[0.98]"
          >
            <span>Join Now</span>
            <span aria-hidden="true" className="font-mono text-base">
              ↗
            </span>
          </Link>

          {/* Outlined Secondary "Login" */}
          <Link
            href="/login"
            className="h-12 px-7 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/35 font-bold text-sm sm:text-base inline-flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Login</span>
            <span aria-hidden="true" className="font-mono text-base">
              →
            </span>
          </Link>
        </div>

        {/* Reassuring Subtext Note */}
        <p className="mt-5 text-xs sm:text-sm text-[#a2bcb5] font-sans">
          One account for buying, selling, or both.
        </p>
      </div>
    </section>
  </div>
  );
}
