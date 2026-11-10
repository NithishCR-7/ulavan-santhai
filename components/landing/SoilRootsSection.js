"use client";

import Image from "next/image";

export default function SoilRootsSection() {
  const steps = [
    {
      number: "01 / SEED & GROW",
      title: "It starts in the soil.",
      description: "Farmers grow the produce that feeds homes and businesses.",
    },
    {
      number: "02 / HARVEST & CREATE",
      title: "A harvest finds new value.",
      description:
        "Sell fresh produce or source ingredients to process and make something more.",
    },
    {
      number: "03 / CONNECT",
      title: "Find the right people.",
      description:
        "Buyers discover products. Sellers receive enquiries. One account can do both.",
    },
  ];

  return (
    <section
      id="soil-roots"
      className="relative z-10 w-full text-white m-0 p-0 border-none scroll-mt-20 overflow-hidden"
    >
      {/* 1. Seamless Agricultural Composition: Organic Topsoil Overlapping Video + Fine Living Roots */}
      <div className="absolute top-0 inset-x-0 w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[560px] xl:h-[620px] -mt-7 sm:-mt-10 md:-mt-14 lg:-mt-18 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/soil-roots-unified-master-2x.png"
          alt="Natural agricultural soil cross-section with textured topsoil, delicate living roots and rich earth"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />

        {/* Quiet dark brown overlay behind content for contrast without hiding roots */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-25% to-[#160e0a] pointer-events-none" />
      </div>

      {/* 2. Deep earthy foundation extending beneath the roots across the full section */}
      <div className="absolute inset-0 top-16 sm:top-20 md:top-24 lg:top-28 bg-[#160e0a] -z-10" />

      {/* 3. Editorial Layout: Centered Content Container (1280–1360px) */}
      <div className="relative z-10 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 w-full pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] xl:grid-cols-[1.35fr_1fr_1fr_1fr] gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Column 1: Philosophy & Vision */}
          <div className="flex flex-col justify-start">
            {/* Restrained golden-tan line accent */}
            <div className="w-6 h-[1.5px] bg-[#D4A373] mb-3 rounded-full" />

            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-[#D4A373] block">
              ABOVE THE SOIL. BEYOND THE FIELD.
            </span>

            {/* Display Heading: Plus Jakarta Sans display typography */}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] xl:text-[36px] font-bold sm:font-extrabold text-[#FAF7F2] leading-[1.2] tracking-tight mt-2.5 drop-shadow-sm">
              One harvest. <br />
              <span className="whitespace-nowrap">Many possibilities.</span>
            </h2>

            <p className="font-sans text-xs sm:text-sm text-[#D6CCC2] leading-[1.6] mt-3.5 max-w-xs">
              Every connection carries the farmer’s effort further.
            </p>
          </div>

          {/* Columns 2, 3, 4: The 3 Evolutionary Steps */}
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col justify-start">
              {/* Restrained golden-tan line accent */}
              <div className="w-6 h-[1.5px] bg-[#D4A373] mb-3 rounded-full" />

              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#D4A373] block">
                {step.number}
              </span>

              {/* Step Title: Plus Jakarta Sans display typography */}
              <h3 className="font-display font-bold text-base sm:text-lg lg:text-xl text-[#FAF7F2] tracking-tight leading-snug mt-2.5 drop-shadow-sm">
                {step.title}
              </h3>

              {/* Step Description: Controlled line lengths & comfortable 1.6 line height */}
              <p className="font-sans text-xs sm:text-sm text-[#D6CCC2] leading-[1.6] mt-2.5">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
