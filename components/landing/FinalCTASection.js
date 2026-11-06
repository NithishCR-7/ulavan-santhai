"use client";

import Link from "next/link";
import Image from "next/image";

export default function FinalCTASection() {
  const bgImage =
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80";

  return (
    <section className="py-14 sm:py-20 bg-[#F5F5EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#174B35] text-white shadow-lg">
          {/* Subtle Background Real Farm Landscape */}
          <div className="absolute inset-0 z-0">
            <Image
              src={bgImage}
              alt="Fertile farmland landscape at sunrise"
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover opacity-25 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#103A29] via-[#174B35]/95 to-[#174B35]/85" />
          </div>

          {/* CTA Content Container */}
          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:p-12 max-w-3xl">


            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Be Part of a Growing <br className="hidden sm:inline" />
              <span className="text-[#E8F0E3]">Agricultural Community.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed font-normal">
              Join Ulavan Santhai and create new opportunities through
              agricultural connections.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-white text-[#174B35] hover:bg-[#F5F5EB] font-bold text-base text-center transition-all duration-200 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Now
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-base text-center transition-all duration-200 border border-white/30"
              >
                Login
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#E8F0E3]/80">
              Free account creation • Verified profile onboarding • Direct agricultural connections
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

