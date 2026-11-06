"use client";

import Link from "next/link";

export default function PlansSection() {
  const plans = [
    {
      name: "Buyer & Trader",
      badge: "Sourcing & Procurement",
      price: "₹0",
      period: "Free Forever",
      description:
        "For retailers, restaurants, wholesalers, food processors, and bulk buyers searching for fresh farm produce.",
      features: [
        "Browse verified agricultural crop listings",
        "Direct contact with verified farmers & FPOs",
        "Transparent farm-gate price discovery",
        "Zero middleman commission or sourcing fees",
        "Quality grade & harvest timing disclosures",
      ],
      ctaText: "Start Sourcing Free",
      ctaLink: "/register?role=BUYER",
      highlighted: false,
      btnStyle: "bg-[#174B35]/10 text-[#174B35] hover:bg-[#174B35] hover:text-white border border-[#174B35]/20",
    },
    {
      name: "Farmer & Producer",
      badge: "Most Popular • 0% Commission",
      price: "₹365",
      period: "Per Year (Just ₹1 / day)",
      description:
        "For farmers, growers, and FPOs looking to showcase produce and sell directly to commercial buyers.",
      features: [
        "Verified Producer Green Badge",
        "Unlimited harvest listings & produce updates",
        "Receive direct buyer inquiries & phone calls",
        "0% middleman margin — 100% farm profits",
        "Direct-to-bank instant settlement payments",
        "Priority ranking in regional buyer searches",
      ],
      ctaText: "Join for ₹365 / Year",
      ctaLink: "/register?role=SELLER",
      highlighted: true,
      btnStyle: "bg-[#174B35] text-white hover:bg-[#103A29] shadow-md shadow-emerald-950/20",
    },
    {
      name: "Enterprise & FPO",
      badge: "Bulk Aggregation",
      price: "Custom",
      period: "Tailored Volume",
      description:
        "For large agribusinesses, exporters, and industrial processors requiring contract farming or bulk freight.",
      features: [
        "Multi-district harvest produce aggregation",
        "Direct logistics & freight network support",
        "Lab testing & quality grading coordination",
        "Dedicated agricultural sourcing manager",
        "Custom contracts & scheduled recurring supply",
      ],
      ctaText: "Contact for Enterprise",
      ctaLink: "/register?role=BOTH",
      highlighted: false,
      btnStyle: "bg-[#174B35]/10 text-[#174B35] hover:bg-[#174B35] hover:text-white border border-[#174B35]/20",
    },
  ];

  return (
    <section id="plans" className="py-24 sm:py-32 bg-[#F5F5EB] border-b border-gray-200/60 scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-4 border border-[#729B59]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#729B59]" />
            <span>Marketplace Plans</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#174B35] tracking-tight leading-tight">
            Transparent, Fair &amp; Commission-Free
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68746A] leading-relaxed">
            No hidden charges, no middleman cuts. Keep 100% of your earnings with direct agricultural trade.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted
                  ? "bg-white border-2 border-[#174B35] shadow-2xl shadow-emerald-950/10 md:-translate-y-2 ring-4 ring-[#174B35]/5"
                  : "bg-white/80 border border-gray-200/80 shadow-md hover:shadow-xl hover:border-[#729B59]/40"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#174B35] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  Recommended
                </div>
              )}

              <div>
                {/* Badge & Plan Name */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#729B59]">
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-[#174B35]">{plan.name}</h3>

                <p className="mt-2 text-sm text-[#68746A] leading-relaxed min-h-[42px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mt-6 mb-6 pb-6 border-b border-gray-100 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-[#174B35] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#68746A]">
                    {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-[#263329]">
                      <div className="w-5 h-5 rounded-full bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <Link
                href={plan.ctaLink}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm text-center flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-98 ${plan.btnStyle}`}
              >
                <span>{plan.ctaText}</span>
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

