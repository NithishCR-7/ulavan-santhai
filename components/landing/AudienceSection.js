"use client";

import Link from "next/link";
import Image from "next/image";

export default function AudienceSection() {
  const cards = [
    {
      number: "01",
      title: "Farmers & Sellers",
      description: "Showcase your agricultural products and reach potential buyers.",
      image:
        "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80",
      alt: "Indian farmers harvesting fresh agricultural produce in lush green fields",
      categoryBadge: "Producers & FPOs",
      actionText: "Connect as Seller",
      link: "/register?role=SELLER",
    },
    {
      number: "02",
      title: "Buyers & Traders",
      description: "Discover agricultural products and connect with suppliers.",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
      alt: "Commercial wholesale buyer inspecting farm fresh harvest at regional market",
      categoryBadge: "Commercial Buyers",
      actionText: "Connect as Buyer",
      link: "/register?role=BUYER",
    },
    {
      number: "03",
      title: "Manufacturers & Processors",
      description: "Explore agricultural sourcing and business connections.",
      image:
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1000&q=80",
      alt: "Modern agricultural food processing and produce sorting facility",
      categoryBadge: "Agro Industries",
      actionText: "Explore Sourcing",
      link: "/register?role=BUYER",
    },
    {
      number: "04",
      title: "Wholesalers & Businesses",
      description: "Discover products and build supplier relationships.",
      image:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
      alt: "Organised agricultural wholesale warehouse crates and logistics distribution",
      categoryBadge: "Bulk Distribution",
      actionText: "Build Relationships",
      link: "/register?role=BOTH",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-4 border border-[#729B59]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#729B59]" />
            <span>Marketplace Community</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#174B35] tracking-tight leading-tight">
            Connecting Every Part of Agriculture
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68746A] leading-relaxed">
            Bringing producers, suppliers and buyers together through one platform.
          </p>
        </div>

        {/* Four Audience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {cards.map((card) => (
            <div
              key={card.number}
              className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#729B59]/50 transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5"
            >
              {/* Landscape Photograph with Number Badge */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
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

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors tracking-tight">
                    {card.number}. {card.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-[#68746A] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Interactive Action Link */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={card.link}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors"
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
