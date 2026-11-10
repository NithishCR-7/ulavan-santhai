"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BottomTabBar from "@/components/marketplace/BottomTabBar";
import SellerAccessModal from "@/components/marketplace/SellerAccessModal";
import PostRequirementModal from "@/components/marketplace/PostRequirementModal";
import SupplierProfileModal from "@/components/marketplace/SupplierProfileModal";
import BuyerProfileModal from "@/components/marketplace/BuyerProfileModal";
import HelpModal from "@/components/marketplace/HelpModal";
import {
  getBuyerEnquiries,
  replyToEnquiryAsBuyer,
  updateEnquiryStatus,
} from "@/services/enquiryApi";
import { useSessionUser } from "@/services/sessionAuth";
import { SELLER_DIRECTORY } from "@/data/marketplaceCatalog";
import { getLocalBuyerAccessState } from "@/services/sellerAccessApi";

export default function BuyerEnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB]/60 flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
          Loading your commercial enquiries...
        </div>
      }
    >
      <BuyerEnquiriesContent />
    </Suspense>
  );
}

function BuyerEnquiriesContent() {
  const router = useRouter();
  const sessionUser = useSessionUser();

  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All"); // "All" | "Sent" | "Seen" | "Responded" | "Closed"
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed Modal State
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Modals state
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [isSellerAccessOpen, setIsSellerAccessOpen] = useState(false);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
        if (isMounted) setIsLoading(false);
      }
    }

    loadEnquiries();

    const handleEnquirySubmitted = () => loadEnquiries();
    window.addEventListener("ulavan_enquiry_submitted", handleEnquirySubmitted);
    return () => {
      isMounted = false;
      window.removeEventListener("ulavan_enquiry_submitted", handleEnquirySubmitted);
    };
  }, [sessionUser]);

  const refreshEnquiries = async () => {
    try {
      const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
      const res = await getBuyerEnquiries(buyerId);
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } catch (err) {}
  };

  // Status mapping:
  // "NEW" -> "Sent"
  // "VIEWED" -> "Seen"
  // "RESPONDED" -> "Responded"
  // "CLOSED" -> "Closed"
  const getNormalizedStatus = (enq) => {
    const s = (enq.status || "NEW").toUpperCase();
    if (s === "NEW" || s === "SENT") return "Sent";
    if (s === "VIEWED" || s === "SEEN") return "Seen";
    if (s === "RESPONDED") return "Responded";
    if (s === "CLOSED") return "Closed";
    return "Sent";
  };

  // Filter enquiries by Tab and Search
  const filteredEnquiries = enquiries.filter((enq) => {
    const norm = getNormalizedStatus(enq);
    if (activeTab !== "All" && norm !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (enq.productTitle || enq.commodity || "").toLowerCase().includes(q);
      const matchSeller = (enq.sellerName || "").toLowerCase().includes(q);
      const matchId = (enq.id || "").toLowerCase().includes(q);
      return matchTitle || matchSeller || matchId;
    }
    return true;
  });

  // Reply handler
  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    setReplyError("");

    if (!followUpMessage.trim()) {
      setReplyError("Please enter a message or negotiation note.");
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await replyToEnquiryAsBuyer(activeEnquiry.id, {
        buyerName: sessionUser?.businessName || sessionUser?.name || "Registered Buyer",
        message: followUpMessage.trim(),
      });

      if (res.success && res.data) {
        setActiveEnquiry(res.data);
        setFollowUpMessage("");
        refreshEnquiries();
      } else {
        setReplyError(res.error || "Failed to send message.");
      }
    } catch (err) {
      setReplyError("Network error while sending reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Close enquiry handler
  const handleCloseEnquiry = async () => {
    if (!activeEnquiry) return;
    try {
      const res = await updateEnquiryStatus(activeEnquiry.id, "CLOSED");
      if (res.success && res.data) {
        setActiveEnquiry(res.data);
        refreshEnquiries();
      }
    } catch (e) {}
  };

  // Render Status Badge
  const renderStatusBadge = (statusNorm) => {
    switch (statusNorm) {
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sent
          </span>
        );
      case "Seen":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Seen
          </span>
        );
      case "Responded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Responded
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            {statusNorm}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB]/60 flex flex-col font-sans selection:bg-[#174B35] selection:text-white pb-20 md:pb-12">
      {/* 1. Header (Sticky 2-row header replacing sidebar) */}
      <BuyerHeader
        onSearch={(q, cat) => router.push(`/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`)}
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title Bar & Search */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/marketplace" className="hover:text-[#174B35] font-semibold">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">My Enquiries</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                My Enquiries &amp; Quotations Desk
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Track direct grower purchase enquiries, supplier responses, and wholesale contracts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPostRequirementOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-center"
            >
              + Post New Requirement
            </button>
          </div>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by commodity, supplier, or reference ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
              />
            </div>
          </div>
        </div>

        {/* 5 Exact Status Tabs: All, Sent, Seen, Responded, Closed */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {["All", "Sent", "Seen", "Responded", "Closed"].map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === "All"
                ? enquiries.length
                : enquiries.filter((e) => getNormalizedStatus(e) === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-[#174B35] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Enquiries Content Table / Cards */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading your enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-3xl flex items-center justify-center mx-auto text-[#174B35]">
              📨
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                No enquiries found under {activeTab}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Connect with verified Tamil Nadu producers by sending a direct enquiry on any listing.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex px-6 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] shadow-sm transition-all"
              >
                Browse Marketplace &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Table of Enquiries (Desktop) / Cards (Mobile) */
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold">
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Product / Category</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEnquiries.map((enq) => {
                    const statusNorm = getNormalizedStatus(enq);
                    return (
                      <tr key={enq.id} className="hover:bg-emerald-50/30 transition-colors">
                        {/* 1. Reference */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {enq.id}
                        </td>

                        {/* 2. Product / Category */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-gray-900 line-clamp-1">
                            {enq.productTitle || enq.commodity || "Produce Lot"}
                          </div>
                          <div className="text-[11px] text-[#729B59] font-medium">
                            {enq.productCategory || "Agricultural Products"}
                          </div>
                        </td>

                        {/* 3. Supplier */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {enq.sellerName || "Verified Producer"}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {enq.sellerDistrict || "Tamil Nadu"}
                          </div>
                        </td>

                        {/* 4. Quantity */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-gray-900">
                          {enq.requestedQuantity} {enq.unitRequested || enq.unit || "kg"}
                        </td>

                        {/* 5. Date */}
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                          {enq.formattedDate || new Date(enq.createdAt).toLocaleDateString("en-IN")}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderStatusBadge(statusNorm)}
                        </td>

                        {/* 7. Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveEnquiry(enq)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Screen 10: Detailed Enquiry Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full">
                    {activeEnquiry.id}
                  </span>
                  {renderStatusBadge(getNormalizedStatus(activeEnquiry))}
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {activeEnquiry.productTitle || activeEnquiry.commodity}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supplier: <strong>{activeEnquiry.sellerName}</strong> • {activeEnquiry.sellerDistrict}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 text-xs">
              {/* Submitted Parameters Summary Grid */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Commercial Terms Submitted
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-500 block">Requested Volume</span>
                    <strong className="text-gray-900">{activeEnquiry.requestedQuantity} {activeEnquiry.unitRequested || "kg"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Quality Grade</span>
                    <strong className="text-gray-900">{activeEnquiry.grade || "Grade A (Premium)"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Packaging</span>
                    <strong className="text-gray-900">{activeEnquiry.packaging || "Standard Commercial Bags"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Delivery Destination</span>
                    <strong className="text-gray-900">{activeEnquiry.deliveryLocation || "Tamil Nadu"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Needed-by Date</span>
                    <strong className="text-gray-900">{activeEnquiry.neededByDate || "Standard Mandi Schedule"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Target Price</span>
                    <strong className="text-gray-900">{activeEnquiry.targetPrice ? `₹${activeEnquiry.targetPrice}` : "Fair Mandi Rate"}</strong>
                  </div>
                </div>

                {activeEnquiry.additionalRequirements && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-500 block">Notes / Technical Requirements:</span>
                    <p className="text-gray-700 italic mt-0.5">{activeEnquiry.additionalRequirements}</p>
                  </div>
                )}
              </div>

              {/* Message Thread History */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Conversation &amp; Supplier Response Thread
                </h4>

                <div className="space-y-2.5">
                  {Array.isArray(activeEnquiry.messages) && activeEnquiry.messages.map((msg, idx) => {
                    const isBuyerMsg = msg.senderRole === "BUYER";
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border ${
                          isBuyerMsg
                            ? "bg-[#E8F0E3]/60 border-emerald-200 ml-4 sm:ml-8"
                            : "bg-white border-gray-200 mr-4 sm:mr-8 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100/80 mb-1.5">
                          <span className="font-bold text-gray-900">
                            {isBuyerMsg ? "You (Buyer)" : msg.senderName || activeEnquiry.sellerName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {msg.formattedTime || new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{msg.message}</p>
                        {msg.quotedPrice && (
                          <div className="mt-2 p-2 bg-emerald-100/70 rounded-lg text-[11px] font-bold text-[#174B35]">
                            Quoted Mandi Price: ₹{msg.quotedPrice} per {msg.unit || "kg"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box (if not closed) */}
              {activeEnquiry.status !== "CLOSED" ? (
                <form onSubmit={handleSendFollowUp} className="space-y-2.5 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-800">
                    Send Reply / Counter-Offer to Supplier:
                  </label>
                  {replyError && (
                    <div className="text-xs text-red-600 font-semibold">{replyError}</div>
                  )}
                  <textarea
                    rows={2}
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Type your message, confirm delivery dates, or ask for transport terms..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleCloseEnquiry}
                      className="text-xs text-gray-500 hover:text-red-600 hover:underline cursor-pointer"
                    >
                      Mark as Closed
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReply}
                      className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSendingReply ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-center text-gray-500 text-xs font-medium">
                  This enquiry thread has been marked as closed.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const sup = SELLER_DIRECTORY.find((s) => s.id === activeEnquiry.sellerId || s.name === activeEnquiry.sellerName);
                  setSelectedSupplierForModal(
                    sup || {
                      id: activeEnquiry.sellerId,
                      name: activeEnquiry.sellerName,
                      district: activeEnquiry.sellerDistrict,
                      sellerType: "Verified Producer",
                      verified: true,
                    }
                  );
                }}
                className="text-xs font-bold text-[#174B35] hover:underline cursor-pointer"
              >
                View Supplier Contact &rarr;
              </button>
              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Modals */}
      <SupplierProfileModal
        isOpen={!!selectedSupplierForModal}
        supplier={selectedSupplierForModal}
        onClose={() => setSelectedSupplierForModal(null)}
      />

      <SellerAccessModal
        isOpen={isSellerAccessOpen}
        onClose={() => setIsSellerAccessOpen(false)}
      />

      <PostRequirementModal
        isOpen={isPostRequirementOpen}
        onClose={() => setIsPostRequirementOpen(false)}
      />

      <BuyerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
