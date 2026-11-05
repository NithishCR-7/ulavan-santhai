"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import {
  getSellerEnquiries,
  respondToEnquiry,
  updateEnquiryStatus,
} from "@/services/enquiryApi";
import { getLocalSellerProfile } from "@/services/sellerApi";
import { useSessionUser } from "@/services/sessionAuth";

export default function SellerEnquiriesPage() {
  const sessionUser = useSessionUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [sellerProfile] = useState(() => getLocalSellerProfile());
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Respond Modal State
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [responseSuccess, setResponseSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEnquiries() {
      try {
        const profile = getLocalSellerProfile();
        const res = await getSellerEnquiries(profile?.applicationId || "APP_US_982412");
        if (isMounted && res.success && Array.isArray(res.data)) {
          setEnquiries(res.data);
        }
      } catch (err) {
        console.error("Error loading seller enquiries:", err);
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
  }, []);

  const refreshEnquiries = async () => {
    try {
      const profile = getLocalSellerProfile();
      const res = await getSellerEnquiries(profile?.applicationId || "APP_US_982412");
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error("Error refreshing seller enquiries:", err);
    }
  };

  // Open modal and auto-mark as VIEWED if NEW
  const handleOpenEnquiry = async (enquiry) => {
    setActiveEnquiry(enquiry);
    setResponseMessage(
      `Vanakkam! Thank you for your enquiry for ${enquiry.productTitle}. We have ready harvest stock and can dispatch according to your schedule.`
    );
    setQuotedPrice(enquiry.pricePerUnit ? String(enquiry.pricePerUnit) : "");
    setAvailableQuantity(`${enquiry.requestedQuantity} ${enquiry.unitRequested}`);
    setAdditionalNotes("");
    setResponseError("");
    setResponseSuccess("");

    if (enquiry.status === "NEW") {
      try {
        const updateRes = await updateEnquiryStatus(enquiry.id, "VIEWED");
        if (updateRes.success) {
          setActiveEnquiry(updateRes.data);
          setEnquiries((prev) =>
            prev.map((e) => (e.id === enquiry.id ? updateRes.data : e))
          );
        }
      } catch (err) {
        console.error("Error updating enquiry status to VIEWED:", err);
      }
    }
  };

  // Submit response to buyer
  const handleSendResponse = async (e) => {
    e.preventDefault();
    setResponseError("");
    setResponseSuccess("");

    if (!responseMessage.trim()) {
      setResponseError("Please write a response message for the buyer.");
      return;
    }

    setIsSubmittingResponse(true);

    try {
      const res = await respondToEnquiry(activeEnquiry.id, {
        sellerName: sellerProfile?.name || sessionUser?.name || "Farmer Ramesh Kumar",
        responseMessage: responseMessage.trim(),
        quotedPrice: quotedPrice ? Number(quotedPrice) : null,
        availableQuantity: availableQuantity.trim(),
        additionalNotes: additionalNotes.trim(),
      });

      if (res.success && res.data) {
        setActiveEnquiry(res.data);
        setResponseSuccess("✓ Response sent to buyer successfully!");
        setResponseMessage("");
        // Reload enquiries
        refreshEnquiries();
      } else {
        setResponseError(res.error || "Failed to send response.");
      }
    } catch (err) {
      console.error("Error sending seller response:", err);
      setResponseError("Network error. Please try again.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Mark enquiry closed
  const handleCloseEnquiry = async () => {
    if (!activeEnquiry) return;
    try {
      const res = await updateEnquiryStatus(activeEnquiry.id, "CLOSED");
      if (res.success) {
        setActiveEnquiry(res.data);
        setResponseSuccess("Enquiry marked as closed.");
        refreshEnquiries();
      }
    } catch (err) {
      console.error("Error closing enquiry:", err);
    }
  };

  // Filter calculations
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "NEW").length;
  const respondedCount = enquiries.filter((e) => e.status === "RESPONDED").length;
  const closedCount = enquiries.filter((e) => e.status === "CLOSED").length;

  const filteredEnquiries = enquiries.filter((enq) => {
    if (filterTab === "NEW" && enq.status !== "NEW") return false;
    if (filterTab === "RESPONDED" && enq.status !== "RESPONDED") return false;
    if (filterTab === "CLOSED" && enq.status !== "CLOSED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBuyer = (enq.buyerName || "").toLowerCase().includes(q);
      const matchProduct = (enq.productTitle || "").toLowerCase().includes(q);
      const matchSubject = (enq.subject || "").toLowerCase().includes(q);
      const matchDistrict = (enq.buyerDistrict || "").toLowerCase().includes(q);
      return matchBuyer || matchProduct || matchSubject || matchDistrict;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      <SellerHeader
        sellerName={sellerProfile?.name || "Farmer Ramesh Kumar"}
        sellerType={sellerProfile?.sellerType || "Organic Producer"}
        farmName={sellerProfile?.farmName || "Kongu Natural Organic Farms"}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        <SellerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Header & Metric Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Link href="/seller/dashboard" className="text-[#174B35] font-bold hover:underline">
                  Seller Dashboard
                </Link>
                <span>/</span>
                <span className="text-gray-400">Buyer Enquiries</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight">
                Buyer Enquiries
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Direct wholesale purchase requests and rate quotations from verified commercial buyers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                0% Middleman Commission
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
              <span className="text-xs text-gray-400 font-bold block">Total Received</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{totalCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
              <span className="text-xs text-amber-700 font-bold block">New / Unanswered</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">{newCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <span className="text-xs text-emerald-700 font-bold block">Responded</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">{respondedCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
              <span className="text-xs text-gray-400 font-bold block">Closed Deals</span>
              <span className="text-2xl font-black text-gray-700 mt-1 block">{closedCount}</span>
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: `All (${totalCount})` },
                { id: "NEW", label: `New (${newCount})` },
                { id: "RESPONDED", label: `Responded (${respondedCount})` },
                { id: "CLOSED", label: `Closed (${closedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab.id
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
                placeholder="Search by buyer, crop, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
              />
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-gray-400 pointer-events-none">
                🔍
              </span>
            </div>
          </div>

          {/* Enquiries Listing */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">
              <div className="w-6 h-6 border-2 border-[#174B35]/30 border-t-[#174B35] rounded-full animate-spin mx-auto mb-2"></div>
              Loading buyer enquiries...
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/90 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5EB] text-[#174B35] flex items-center justify-center mx-auto text-2xl font-black">
                💬
              </div>
              <h3 className="text-base font-bold text-gray-900">No Enquiries Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || filterTab !== "ALL"
                  ? "No enquiries match your search or filter. Try switching to 'All'."
                  : "You have not received any purchase requests yet. When buyers view your crops on the marketplace, their direct enquiries will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs ${
                    enquiry.status === "NEW"
                      ? "border-amber-300 bg-amber-50/10"
                      : "border-gray-200/90 hover:border-[#729B59]/60"
                  }`}
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
                        {enquiry.status === "NEW" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            New Enquiry
                          </span>
                        )}
                        {enquiry.status === "VIEWED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                            Viewed
                          </span>
                        )}
                        {enquiry.status === "RESPONDED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            ✓ Responded
                          </span>
                        )}
                        {enquiry.status === "CLOSED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            Closed
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 font-semibold">
                          Ref: {enquiry.id}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {enquiry.formattedDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="text-base sm:text-lg font-black text-gray-900">
                          {enquiry.buyerName}
                        </h3>
                        <span className="text-xs text-gray-500 font-medium">
                          ({enquiry.buyerType || "Business"} &bull; {enquiry.buyerDistrict})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
                        <span className="text-[#174B35] font-bold">Crop: {enquiry.productTitle}</span>
                        <span>&bull;</span>
                        <span className="text-gray-900 font-bold">
                          Requested Qty: {enquiry.requestedQuantity} {enquiry.unitRequested}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 italic bg-[#F5F5EB] p-2.5 rounded-xl border border-gray-200/60 line-clamp-2">
                        &ldquo;{enquiry.messages?.[0]?.message || enquiry.subject}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(enquiry)}
                      className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>View &amp; Respond</span>
                      <span>&rarr;</span>
                    </button>

                    <span className="text-[11px] text-gray-400">
                      {enquiry.messages?.length || 1} message(s) in thread
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View & Respond Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#729B59] tracking-wider block">
                  Buyer Purchase Request Ref: {activeEnquiry.id}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  {activeEnquiry.buyerName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeEnquiry.buyerType} &bull; {activeEnquiry.buyerDistrict} &bull;{" "}
                  Phone: <strong>{activeEnquiry.buyerPhone || "Direct Contact"}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveEnquiry(null);
                  setResponseError("");
                  setResponseSuccess("");
                }}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Produce Summary Pill */}
            <div className="my-3 p-3 rounded-2xl bg-[#F5F5EB] border border-gray-200/80 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#174B35]">{activeEnquiry.productTitle}</span>
                <span>&bull;</span>
                <span className="text-gray-600">
                  Requested: <strong>{activeEnquiry.requestedQuantity} {activeEnquiry.unitRequested}</strong>
                </span>
              </div>
              <span className="font-mono text-gray-500">
                Catalog Rate: ₹{activeEnquiry.pricePerUnit}/{activeEnquiry.unit}
              </span>
            </div>

            {/* Response Success Notice */}
            {responseSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">
                {responseSuccess}
              </div>
            )}

            {/* Message Thread History (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {activeEnquiry.messages?.map((msg, index) => {
                const isSeller = msg.senderRole === "SELLER";
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mb-1">
                      <span>{msg.senderName} ({msg.senderRole === "SELLER" ? "You" : "Buyer"})</span>
                      <span>&bull;</span>
                      <span>{msg.formattedTime || "Today"}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2 shadow-2xs ${
                        isSeller
                          ? "bg-[#174B35] text-white rounded-br-xs"
                          : "bg-[#F5F5EB] text-gray-900 border border-gray-200 rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                      {msg.quotedPrice && (
                        <div className="p-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs font-bold space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quoted Rate:</span>
                            <span className="text-[#174B35]">₹{msg.quotedPrice} / {activeEnquiry.unitRequested}</span>
                          </div>
                          {msg.availableQuantity && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Stock Ready:</span>
                              <span>{msg.availableQuantity}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.additionalRequirements && (
                        <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-600">
                          Buyer Notes: {msg.additionalRequirements}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seller Response Form */}
            {activeEnquiry.status !== "CLOSED" ? (
              <form onSubmit={handleSendResponse} className="pt-3 border-t border-gray-100 shrink-0 space-y-3">
                {responseError && (
                  <p className="text-xs text-red-600 font-semibold">{responseError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Quoted Wholesale Price (₹/{activeEnquiry.unitRequested})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 135"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Available Ready Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1500 kg ready for dispatch"
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Response Message to Buyer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about harvest batch, dispatch vehicle, packing terms..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCloseEnquiry}
                    className="text-xs font-semibold text-gray-500 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Mark Deal as Closed
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveEnquiry(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingResponse}
                      className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingResponse ? "Sending..." : "Send Response &rarr;"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
                This enquiry is closed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
