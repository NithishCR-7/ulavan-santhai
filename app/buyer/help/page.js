"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import {
  HelpCircleIcon,
  HomeIcon,
  CreditCardIcon,
  MailIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/marketplace/Icons";

export default function BuyerHelpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading help and resources...
        </div>
      }
    >
      <BuyerHelpContent />
    </Suspense>
  );
}

function BuyerHelpContent() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does seller access work?",
      a: "Every verified buyer receives access to 10 unique farm producers as part of their annual Rs 365 platform membership. Access is consumed only the first time you reveal a seller's direct phone or send an initial enquiry. Repeated contacts, messages, or re-visiting that seller consume 0 additional views.",
    },
    {
      q: "What happens when my 10 seller accesses are exhausted?",
      a: "You can continue browsing the marketplace, searching categories, comparing specifications, and saving products without restriction. To unlock direct contact or enquire with an 11th new seller, you can purchase an additional 10-view pack for Rs 10.",
    },
    {
      q: "Is Ulavan Santhai an e-commerce checkout platform?",
      a: "No. Ulavan Santhai is a direct B2B wholesale discovery and connection marketplace. Transactions, physical inspections, mandi rate confirmations, and delivery arrangements occur directly between the buyer and the producer via direct enquiry.",
    },
    {
      q: "How do I communicate with a seller?",
      a: "When you view a product listing, click 'Enquire with Seller' or 'Send Enquiry'. Provide your required volume, delivery destination, and target price. Your enquiry will be delivered to the producer, and you can track status and continue discussions under 'My Enquiries'.",
    },
    {
      q: "Does saving a product to Wishlist consume seller quota?",
      a: "No. Bookmarking products to your Saved Products list never consumes seller access. You can save as many produce lots as needed for commercial comparison.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
      />

      {/* 2. Main Container with Sidebar + Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: Help & Support Workspace */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-[#174B35] flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>&gt;</span>
              <span className="font-bold text-gray-900">Help &amp; Support</span>
            </nav>

            {/* Page Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#174B35] text-xs font-bold uppercase tracking-wider">
                <HelpCircleIcon className="w-3.5 h-3.5 text-[#174B35]" />
                <span>Platform Documentation</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Help &amp; Buyer Sourcing Guide
              </h1>
              <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                Everything you need to know about navigating the wholesale agricultural catalog, connecting with verified farm producers, and managing your seller access entitlement.
              </p>
            </div>

            {/* 3 Guide Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold">
                  <CreditCardIcon className="w-5 h-5 text-[#174B35]" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Seller Access Rules</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Understand how your 10 free unique seller views work and how to add packs of 10 accesses for Rs 10.
                </p>
                <Link
                  href="/buyer/subscription"
                  className="text-xs font-bold text-[#174B35] hover:underline inline-block pt-1"
                >
                  View Access Details &rarr;
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold">
                  <MailIcon className="w-5 h-5 text-[#174B35]" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Enquiry Workflow</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Learn how to specify volume, delivery terms, and quality grade when requesting farm-gate quotes.
                </p>
                <Link
                  href="/buyer/enquiries"
                  className="text-xs font-bold text-[#174B35] hover:underline inline-block pt-1"
                >
                  My Enquiries Desk &rarr;
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#174B35] flex items-center justify-center font-bold">
                  <ShieldCheckIcon className="w-5 h-5 text-[#174B35]" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Verified Sellers</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Producers with active documentation and harvest verification displaying verified badges.
                </p>
                <Link
                  href="/buyer/sellers"
                  className="text-xs font-bold text-[#174B35] hover:underline inline-block pt-1"
                >
                  Browse Suppliers &rarr;
                </Link>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="w-full text-left p-4 bg-gray-50/50 hover:bg-gray-50 font-bold text-xs sm:text-sm text-gray-900 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUpIcon className="w-4 h-4 text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}

