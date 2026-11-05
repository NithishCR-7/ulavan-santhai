"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import {
  getBuyerEnquiries,
  replyToEnquiryAsBuyer,
} from "@/services/enquiryApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function BuyerEnquiriesPage() {
  const sessionUser = useSessionUser();

  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Conversation Modal State
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEnquiries() {
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const res = await getBuyerEnquiries(buyerId);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setEnquiries(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch buyer enquiries:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEnquiries();

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const refreshEnquiries = async () => {
    try {
      const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
      const res = await getBuyerEnquiries(buyerId);
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error("Failed to refresh buyer enquiries:", err);
    }
  };

  // Filter enquiries
  const filteredEnquiries = enquiries.filter((enq) => {
    // Status tab filter
    if (filterStatus === "NEW" && enq.status !== "NEW" && enq.status !== "VIEWED") return false;
    if (filterStatus === "RESPONDED" && enq.status !== "RESPONDED") return false;
    if (filterStatus === "CLOSED" && enq.status !== "CLOSED") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (enq.productTitle || "").toLowerCase().includes(q);
      const matchSeller = (enq.sellerName || "").toLowerCase().includes(q);
      const matchSubject = (enq.subject || "").toLowerCase().includes(q);
      return matchTitle || matchSeller || matchSubject;
    }

    return true;
  });

  // Handle buyer follow-up reply in conversation
  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    setReplyError("");

    if (!followUpMessage.trim()) {
      setReplyError("Please enter a message.");
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await replyToEnquiryAsBuyer(activeEnquiry.id, {
        buyerName: sessionUser?.name || "Registered Buyer",
        message: followUpMessage.trim(),
      });

      if (res.success && res.data) {
        setActiveEnquiry(res.data);
        setFollowUpMessage("");
        // Reload list
        refreshEnquiries();
      } else {
        setReplyError(res.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending follow-up:", err);
      setReplyError("Network error. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Status badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Sent to Producer
          </span>
        );
      case "VIEWED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Viewed by Producer
          </span>
        );
      case "RESPONDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Producer Responded
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      <MarketplaceHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/dashboard" className="text-[#174B35] font-bold hover:underline">
                Buyer Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-400">Enquiries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Purchase Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Track quotation responses and direct communications with agricultural producers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>+ Explore More Crops</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Enquiries" },
              { id: "NEW", label: "Awaiting Reply" },
              { id: "RESPONDED", label: "Responded" },
              { id: "CLOSED", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-[#174B35] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <input
              type="text"
              placeholder="Search by produce or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
            />
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-gray-400 pointer-events-none">
              🔍
            </span>
          </div>
        </div>

        {/* Enquiry Listings */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">
            <div className="w-6 h-6 border-2 border-[#174B35]/30 border-t-[#174B35] rounded-full animate-spin mx-auto mb-2"></div>
            Loading your enquiries...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-2xl font-black">
              💬
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Enquiries Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery || filterStatus !== "ALL"
                  ? "No enquiries match your search or filter. Try selecting 'All Enquiries'."
                  : "You have not sent any purchase enquiries yet. Browse the marketplace and connect directly with verified farmers."}
              </p>
            </div>
            <div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs"
              >
                <span>Browse Agricultural Lots</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => {
              const latestSellerReply = enquiry.messages
                ?.slice()
                .reverse()
                .find((m) => m.senderRole === "SELLER");

              return (
                <div
                  key={enquiry.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs hover:border-[#729B59]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden relative shrink-0 border border-gray-200 bg-gray-50">
                      <Image
                        src={enquiry.productThumbnail || "/images/about-farmer-harvest.jpg"}
                        alt={enquiry.productTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(enquiry.status)}
                        <span className="text-[11px] text-gray-400 font-semibold">
                          Enquiry Ref: {enquiry.id}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {enquiry.formattedDate}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">
                        {enquiry.productTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>Producer: <strong className="text-gray-800">{enquiry.sellerName}</strong></span>
                        <span>&bull;</span>
                        <span>Qty: <strong className="text-gray-900">{enquiry.requestedQuantity} {enquiry.unitRequested}</strong></span>
                        <span>&bull;</span>
                        <span>Location: {enquiry.sellerDistrict}</span>
                      </div>

                      {/* Initial Enquiry Subject & Message Preview */}
                      <p className="text-xs text-gray-600 italic line-clamp-1 mt-1">
                        &ldquo;{enquiry.messages?.[0]?.message || enquiry.subject}&rdquo;
                      </p>

                      {/* Latest Seller Response Preview if available */}
                      {latestSellerReply && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                          <span className="font-bold shrink-0">Producer Reply:</span>
                          <span className="italic line-clamp-1 flex-1">
                            &ldquo;{latestSellerReply.message}&rdquo;
                          </span>
                          {latestSellerReply.quotedPrice && (
                            <span className="font-black text-[#174B35] shrink-0">
                              Offered: ₹{latestSellerReply.quotedPrice}/{enquiry.unitRequested}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveEnquiry(enquiry)}
                      className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>View Conversation</span>
                      <span>({enquiry.messages?.length || 1}) &rarr;</span>
                    </button>

                    <Link
                      href={`/marketplace/products/${enquiry.productId}`}
                      className="text-[11px] font-bold text-gray-500 hover:text-[#174B35] hover:underline"
                    >
                      View Produce Page
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Conversation History Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden relative shrink-0 border border-gray-200">
                  <Image
                    src={activeEnquiry.productThumbnail || "/images/about-farmer-harvest.jpg"}
                    alt={activeEnquiry.productTitle}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                      {activeEnquiry.productTitle}
                    </h3>
                    {renderStatusBadge(activeEnquiry.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Supplier: <strong>{activeEnquiry.sellerName}</strong> ({activeEnquiry.sellerDistrict})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveEnquiry(null);
                  setFollowUpMessage("");
                  setReplyError("");
                }}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Conversation Messages Thread (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {activeEnquiry.messages?.map((msg, index) => {
                const isBuyer = msg.senderRole === "BUYER";
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mb-1">
                      <span>{msg.senderName}</span>
                      <span>&bull;</span>
                      <span>{msg.formattedTime || "Today"}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2 shadow-2xs ${
                        isBuyer
                          ? "bg-[#174B35] text-white rounded-br-xs"
                          : "bg-[#F5F5EB] text-gray-900 border border-gray-200 rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                      {/* Quoted Rate / Stock Highlights in Seller Message */}
                      {msg.quotedPrice && (
                        <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs font-bold space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Offered Rate:</span>
                            <span className="text-[#174B35]">₹{msg.quotedPrice} / {activeEnquiry.unitRequested}</span>
                          </div>
                          {msg.availableQuantity && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Ready Stock:</span>
                              <span>{msg.availableQuantity}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Requirements in Initial Message */}
                      {msg.additionalRequirements && (
                        <div className="pt-2 border-t border-white/20 text-[11px] opacity-90">
                          Special Requirements: {msg.additionalRequirements}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply / Follow-up Input */}
            {activeEnquiry.status !== "CLOSED" ? (
              <form onSubmit={handleSendFollowUp} className="pt-3 border-t border-gray-100 shrink-0 space-y-2">
                {replyError && (
                  <p className="text-xs text-red-600 font-semibold">{replyError}</p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type follow-up response or question to producer..."
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply}
                    className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSendingReply ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
                This enquiry is closed. Start a new enquiry from the product page if needed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
