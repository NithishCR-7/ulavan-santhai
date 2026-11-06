"use client";

import Link from "next/link";
import Image from "next/image";

export default function AudienceSection() {
  const cards = [
    {
      number: "01",
      title: "Farmers & Sellers",
      description: "Showcase your agricultural products and reach potential buyers.",
      image: "/images/photographs/farmer-harvest.jpg",
      alt: "Farmer holding freshly harvested vegetables in a field",
      categoryBadge: "Producers & FPOs",
      actionText: "Connect as Seller",
      link: "/register?role=SELLER",
    },
    {
      number: "02",
      title: "Buyers & Traders",
      description: "Discover agricultural products and connect with suppliers.",
      image: "/images/photographs/market-crates.jpg",
      alt: "Cabbages and onions stacked in produce crates at a market",
      categoryBadge: "Commercial Buyers",
      actionText: "Connect as Buyer",
      link: "/register?role=BUYER",
    },
    {
      number: "03",
      title: "Manufacturers & Processors",
      description: "Explore agricultural sourcing and business connections.",
      image: "/images/photographs/produce-processing.jpg",
      alt: "Agricultural produce sorting, grading and processing equipment in a modern food processing facility",
      categoryBadge: "Agro Industries",
      actionText: "Explore Sourcing",
      link: "/register?role=BUYER",
    },
    {
      number: "04",
      title: "Wholesalers & Businesses",
      description: "Discover products and build supplier relationships.",
      image: "/images/photographs/produce-warehouse.jpg",
      alt: "Worker sorting baskets of lychee fruit in a produce warehouse",
      categoryBadge: "Bulk Distribution",
      actionText: "Build Relationships",
      link: "/register?role=BOTH",
    },
  ];

  return (
    <section id="who-its-for" className="py-14 sm:py-20 bg-white border-b border-gray-100 scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-9 sm:mb-12">


          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#174B35] tracking-tight leading-tight font-display">
            Connecting Every Part of Agriculture
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68746A] leading-relaxed">
            Bringing producers, suppliers and buyers together through one platform.
          </p>
        </div>

        {/* 1. Four Audience Cards Grid: Consistent Dimensions, Typography & Authentic Photography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
          {cards.map((card, index) => (
            <div
              key={card.number}
              className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#174B35]/40 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
            >
              {/* Landscape Photograph with Matching Aspect Ratio */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Numbered Pill Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#174B35] font-mono font-bold text-xs shadow-xs border border-white/60">
                    {card.number}
                  </span>
                </div>

                {/* Category Pill Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
                    {card.categoryBadge}
                  </span>
                </div>
              </div>

              {/* Card Body with Aligned Layout */}
              <div className={`tone-card tone-body p-6 sm:p-7 flex flex-col flex-1 justify-between ${index % 2 ? "tone-green" : "tone-white"}`}>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#174B35] tracking-tight font-display">
                    {card.number}. {card.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-[#5C6B5E] leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                {/* Interactive Action Link */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={card.link}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#174B35] rounded-sm"
                  >
                    <span>{card.actionText}</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
