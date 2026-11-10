"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function WhyChooseUsSection() {
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
  const features = [
    {
      number: "01",
      title: "One Common Platform",
      description: "Bring agricultural producers, suppliers, buyers and businesses together.",
      icon: (
        // Lucide Globe
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Discover Products & Suppliers",
      description: "Explore agricultural categories and find relevant suppliers.",
      icon: (
        // Lucide Search
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Buyer & Seller Accounts",
      description: "Register as a buyer, seller or both based on your business needs.",
      icon: (
        // Lucide Users
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Seller Profile Review",
      description: "A structured profile review process supports seller onboarding.",
      icon: (
        // Lucide ShieldCheck
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      number: "05",
      title: "Business Connections",
      description: "Find relevant agricultural businesses and build new connections.",
      icon: (
        // Lucide Handshake
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0l-1.6 1.6" />
          <path d="m14 8 2.3 2.3a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0 0-1.4L18 3.2a1 1 0 0 0-1.4 0l-2.6 2.6" />
          <path d="M3 13.5v3.2a1 1 0 0 0 .3.7l6.7 6.7a1 1 0 0 0 1.4 0l3.6-3.6" />
          <path d="M7 9.5 4.7 7.2a1 1 0 0 0-1.4 0L2 8.5" />
          <path d="M7 5.5 9.3 3.2a1 1 0 0 1 1.4 0L14 6.5" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 bg-[#F5F5EB] border-b border-gray-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Real Agricultural Image (Slide in from left side + scale 0.94 -> 1) */}
          <div
            className={`lg:col-span-5 relative transform transition-all duration-1050 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              revealed
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 -translate-x-8 sm:-translate-x-10 scale-[0.94]"
            }`}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backing decorative frame */}
              <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-[#729B59]/20 -z-10" />

              {/* Main Photograph: Indian Farmer in Real Lush Green Agricultural Field */}
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white aspect-[4/5] relative group">
                <Image
                  src="/images/photographs/coconut-harvest-supplied.png"
                  alt="Worker harvesting coconuts in a coconut plantation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#103A29]/75 via-transparent to-transparent opacity-75" />

                {/* Elegant Caption Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-[#729B59]">
                    Agriculture &bull; Trust &bull; Growth
                  </div>
                  <div className="text-sm font-bold text-[#174B35] mt-0.5">
                    Connecting Farmers &amp; Bulk Buyers Nationwide
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Section Heading & Five Feature Rows (Slide in from right) */}
          <div
            className={`lg:col-span-7 space-y-6 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              revealed
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 sm:translate-x-10"
            }`}
          >
            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#174B35] tracking-tight leading-tight">
              Bringing Agriculture <br className="hidden sm:inline" />
              <span className="text-[#729B59]">Closer to Opportunity</span>
            </h2>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#263329]/80 leading-relaxed font-normal">
              A common marketplace designed to connect agricultural producers, suppliers and businesses.
            </p>

            {/* Five Feature Rows Arranged Vertically with short stagger */}
            <div className="space-y-3.5 pt-2">
              {features.map((feat, index) => (
                <div
                  key={feat.number}
                  className={`tone-card p-5 rounded-2xl border border-[#E8F0E3] shadow-xs flex items-start gap-4 transition-all duration-900 group ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    index % 2 ? "tone-green" : "tone-white"
                  } ${
                    revealed
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: revealed ? `${120 + index * 120}ms` : "0ms",
                  }}
                >
                  {/* Forest-Green Icon in Light-Green Container */}
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E3] text-[#174B35] group-hover:bg-[#174B35] group-hover:text-white transition-colors duration-200 flex items-center justify-center shrink-0 mt-0.5">
                    {feat.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68746A] mt-0.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div
              className={`pt-3 transform transition-all duration-950 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: revealed ? "750ms" : "0ms" }}
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Create Your Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
