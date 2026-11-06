"use client";

import Link from "next/link";
import Image from "next/image";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Register on Ulavan Santhai as a buyer, seller or both.",
      image:
        "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
      alt: "Person using a smartphone to enter information",
    },
    {
      number: "02",
      title: "Complete Your Profile",
      description: "Add your personal or business details and relevant information.",
      image:
        "/images/photographs/business-profile.jpg",
      alt: "Business professionals reviewing information on a tablet",
    },
    {
      number: "03",
      title: "Discover & Showcase",
      description: "Explore agricultural products or showcase what you supply.",
      image:
        "/images/photographs/market-crates.jpg",
      alt: "Fresh vegetables displayed in market crates",
    },
    {
      number: "04",
      title: "Connect & Grow",
      description: "Discover relevant buyers, sellers and business opportunities.",
      image:
        "/images/photographs/wholesale-market.jpg",
      alt: "Agricultural workers sorting harvested crops together",
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-[#F5F5EB] border-b border-gray-200/60 scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="max-w-3xl mx-auto text-center mb-9 sm:mb-12">


          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#174B35] tracking-tight leading-tight">
            How Ulavan Santhai Works
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68746A] leading-relaxed">
            From creating an account to building meaningful agricultural business connections, getting started is simple.
          </p>
        </div>

        {/* ================= DESKTOP HORIZONTAL TIMELINE JOURNEY ================= */}
        <div className="hidden lg:block">
          {/* Progress Connecting Line & Milestone Nodes */}
          <div className="relative mb-8">
            {/* The horizontal connecting line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#174B35] via-[#729B59] to-[#174B35]/40 -z-0" />

            {/* 4 Evenly Spaced Step Nodes */}
            <div className="grid grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div key={step.number} className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#174B35] text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-[#F5F5EB] shadow-xs transition-all duration-300">
                    {step.number}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Step Columns: Rounded Rectangular Photographs + Typography */}
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group flex flex-col transition-all duration-300"
              >
                {/* Rounded Rectangular Photograph */}
                <div className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden bg-white shadow-xs border-2 border-white group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    sizes="(max-width: 1280px) 25vw, 280px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Step Metadata & Typography */}
                <div className={`tone-card rounded-2xl p-5 mt-4 flex-1 text-left ${index % 2 ? "tone-green" : "tone-white"}`}>
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#729B59] block mb-1">
                    Step {step.number}
                  </span>

                  <h3 className="text-lg font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors tracking-tight leading-snug">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#68746A] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MOBILE & TABLET VERTICAL TIMELINE ================= */}
        <div className="lg:hidden relative pl-6 sm:pl-8">
          {/* Vertical connecting line */}
          <div className="absolute left-4 sm:left-5 top-5 bottom-8 w-0.5 bg-gradient-to-b from-[#174B35] via-[#729B59] to-[#174B35]/30" />

          <div className="space-y-10 sm:space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex items-start gap-5 sm:gap-6 group">
                {/* Milestone Node on the Line */}
                <div className="absolute -left-[29px] sm:-left-[33px] top-1.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#174B35] text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-[#F5F5EB] shadow-xs shrink-0 z-10">
                  {step.number}
                </div>

                {/* Step Card Content */}
                <div className={`tone-card flex-1 rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs ${index % 2 ? "tone-green" : "tone-white"}`}>
                  {/* Photograph */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 mb-4">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Step Title & Copy */}
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#729B59] block mb-1">
                    Step {step.number}
                  </span>

                  <h3 className="text-base sm:text-lg font-bold text-[#174B35] tracking-tight">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm text-[#68746A] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-16 sm:mt-20 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Create Your Account Now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <p className="mt-3 text-xs text-[#68746A]">
            Free registration • Role-based onboarding for buyers and sellers
          </p>
        </div>
      </div>
    </section>
  );
}
