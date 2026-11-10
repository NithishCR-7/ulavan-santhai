"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function AboutSection() {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-14 sm:py-20 bg-[#F5F5EB] border-b border-gray-200/60 overflow-hidden scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading, Description & Key Value Pillars (Slide in from left) */}
          <div
            className={`lg:col-span-6 space-y-6 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              revealed
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8 sm:-translate-x-10"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#174B35] tracking-tight leading-tight">
              Bringing the Agricultural <br className="hidden sm:inline" />
              <span className="text-[#729B59]">Community Together</span>
            </h2>

            <p className="text-base sm:text-lg text-[#263329]/85 leading-relaxed font-normal">
              Ulavan Santhai is designed to connect agricultural producers and
              businesses through one common marketplace. Whether you grow,
              supply, process or purchase agricultural products, the platform
              helps you discover relevant business connections.
            </p>

            <p className="text-sm sm:text-base text-[#68746A] leading-relaxed">
              We bridge the gap between rural farming heartlands and commercial buyers,
              eliminating intermediaries and establishing direct, transparent trade partnerships.
            </p>

            {/* Feature Highlights Grid: Staggered reveal for white and green boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                className={`tone-card tone-white p-6 rounded-2xl border border-[#E8F0E3] shadow-xs transform transition-all duration-950 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  revealed
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: revealed ? "180ms" : "0ms" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-[#174B35] text-sm sm:text-base">Direct Access</h3>
                <p className="text-xs text-[#68746A] mt-1 leading-relaxed">
                  Connect directly with primary producers, local aggregators and commercial buyers.
                </p>
              </div>

              <div
                className={`tone-card tone-green p-6 rounded-2xl border border-[#E8F0E3] shadow-xs transform transition-all duration-950 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  revealed
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: revealed ? "320ms" : "0ms" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-[#174B35] text-sm sm:text-base">Documented Trust</h3>
                <p className="text-xs text-[#68746A] mt-1 leading-relaxed">
                  Structured onboarding review and business verification for secure partnerships.
                </p>
              </div>
            </div>

            <div
              className={`pt-2 transform transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: revealed ? "440ms" : "0ms" }}
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#174B35] hover:text-[#729B59] transition-colors"
              >
                <span>Learn how to participate in the marketplace</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Authentic Agricultural Photography Composition (Slide in from right + scale 0.94 -> 1) */}
          <div
            className={`lg:col-span-6 relative mt-6 lg:mt-0 transform transition-all duration-1050 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              revealed
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-8 sm:translate-x-10 scale-[0.94]"
            }`}
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none pb-8 sm:pb-10">
              {/* Soft decorative background glows */}
              <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-[#729B59]/15 blur-2xl -z-10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-[#174B35]/10 blur-xl -z-10 pointer-events-none" />

              {/* Main Image: Farming Community in Terraced Fields */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white group aspect-[16/10]">
                <Image
                  src="/images/photographs/paddy-planting-supplied.png"
                  alt="Farmers planting rice seedlings together in a paddy field"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#174B35] text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  Farming Communities
                </div>
                
                {/* Bottom Caption */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white text-xs sm:text-sm font-semibold drop-shadow-sm">
                  Direct partnerships with regional growers &amp; producer groups
                </div>
              </div>

              {/* Overlapping Secondary Image: Farmer Harvesting Fresh Produce */}
              <div
                className={`relative -mt-14 sm:-mt-16 ml-auto w-4/5 sm:w-3/4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white group aspect-[16/10] z-10 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  revealed
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-6 scale-[0.95]"
                }`}
                style={{ transitionDelay: revealed ? "220ms" : "0ms" }}
              >
                <Image
                  src="/images/photographs/paddy-threshing-supplied.png"
                  alt="Farmers threshing harvested paddy and filling grain sacks in a field"
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#174B35]/95 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  Fresh Harvest
                </div>
                
                {/* Bottom Caption */}
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs sm:text-sm font-semibold drop-shadow-sm">
                  Sourced straight from harvest for verified market demand
                </div>
              </div>

              {/* Floating Trust Badge */}
              <div
                className={`absolute bottom-0 left-2 sm:left-4 z-20 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-[#E8F0E3] transform transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: revealed ? "300ms" : "0ms" }}
              >
                <div className="w-8 h-8 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center font-bold">
                  <svg className="w-4 h-4 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#174B35] leading-none">Verified Network</p>
                  <p className="text-[10px] text-[#68746A] mt-1 leading-none">Connecting Producers &amp; Buyers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
