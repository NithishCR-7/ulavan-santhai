"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerHeader from "@/components/marketplace/BuyerHeader";
import BuyerSidebar from "@/components/marketplace/BuyerSidebar";
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
import {
  MailIcon,
  CloseIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/marketplace/Icons";

export default function BuyerEnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-8 text-xs text-gray-500 font-medium">
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
  const [activeTab, setActiveTab] = useState("All"); // "All" | "Pending" | "Answered"
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

  const getNormalizedStatus = (enq) => {
    const s = (enq.status || "NEW").toUpperCase();
    if (s === "RESPONDED" || s === "ANSWERED") return "Answered";
    return "Pending";
  };

  // Filter enquiries by Tab and Search
  const filteredEnquiries = enquiries.filter((enq) => {
    const norm = getNormalizedStatus(enq);
    if (activeTab === "Pending" && norm !== "Pending") return false;
    if (activeTab === "Answered" && norm !== "Answered") return false;

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
        buyerName: sessionUser?.businessName || sessionUser?.name || "Sherlin A",
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

  // Accurate product image resolver
  const getThumbnailSrc = (enq) => {
    if (enq.productThumbnail && enq.productThumbnail.startsWith("http")) {
      return enq.productThumbnail;
    }
    const title = (enq.productTitle || enq.commodity || "").toLowerCase();
    if (title.includes("apple")) {
      return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80";
    }
    if (title.includes("onion")) {
      return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80";
    }
    if (title.includes("banana")) {
      return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80";
    }
    if (title.includes("moong") || title.includes("dal")) {
      return "https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=400&q=80";
    }
    if (title.includes("rice")) {
      return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
    }
    if (title.includes("turmeric")) {
      return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80";
    }
    return enq.productThumbnail || "/images/photographs/farmer-harvest.jpg";
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#174B35] selection:text-white relative overflow-hidden pb-16">
      {/* 1. Header */}
      <BuyerHeader
        onSearch={(q, cat) =>
          router.push(
            `/marketplace?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat || "")}`
          )
        }
        onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
        onOpenSellerAccess={() => setIsSellerAccessOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container - 2 Column Layout Matching Screenshot 4 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Reusable Buyer Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <BuyerSidebar />
          </div>

          {/* Right Column: My Enquiries Workspace */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                My Enquiries
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Direct procurement enquiries sent to verified farm producers and suppliers.
              </p>
            </div>

            {/* Tabs: All | Pending | Answered */}
            <div className="flex items-center gap-8 border-b border-gray-200">
              {[
                { label: "All", id: "All" },
                { label: "Pending", id: "Pending" },
                { label: "Answered", id: "Answered" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                      isActive
                        ? "text-[#174B35] font-bold"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#174B35] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* List of Enquiries */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-gray-400">
                Loading your enquiries...
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-[#174B35]">
                  <MailIcon className="w-7 h-7 text-[#174B35]" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  No {activeTab !== "All" ? activeTab.toLowerCase() : ""} enquiries found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Enquire with verified farm producers directly on product pages to connect with sellers.
                </p>
                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="inline-flex px-5 py-2.5 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-colors"
                  >
                    Explore Marketplace &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map((enq) => {
                  const statusNorm = getNormalizedStatus(enq);
                  const isAnswered = statusNorm === "Answered";
                  const thumb = getThumbnailSrc(enq);
                  const dateText =
                    enq.formattedDate ||
                    (enq.createdAt
                      ? `Enquired on: ${new Date(enq.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "Enquired recently");

                  return (
                    <div
                      key={enq.id}
                      className="bg-white rounded-2xl border border-gray-150 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4 hover:border-gray-300 transition-all"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 relative">
                          <img
                            src={thumb}
                            alt={enq.productTitle || enq.commodity || "Product"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {enq.productTitle || enq.commodity || "Agricultural Produce"}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {dateText.startsWith("Enquired on:") ? dateText : `Enquired on: ${dateText}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status Pill & View Details Button */}
                      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {isAnswered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EAF5ED] text-[#174B35] border border-emerald-200">
                            <CheckCircleIcon className="w-3.5 h-3.5 text-[#174B35]" />
                            <span>Answered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-orange-200">
                            <ClockIcon className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span>Pending</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveEnquiry(enq)}
                          className="text-xs font-semibold text-gray-700 hover:text-[#174B35] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Detailed Enquiry Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-150 max-h-[92vh] flex flex-col">
            {/* Modal Top */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <img
                    src={getThumbnailSrc(activeEnquiry)}
                    alt={activeEnquiry.productTitle || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {activeEnquiry.productTitle || activeEnquiry.commodity}
                    </h3>
                    {getNormalizedStatus(activeEnquiry) === "Answered" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5ED] text-[#174B35]">
                        Answered
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF7ED] text-[#C2410C]">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seller: <strong>{activeEnquiry.sellerName || "AgriFresh Exports"}</strong> &bull; {activeEnquiry.sellerDistrict || "Tamil Nadu"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs pr-1">
              {/* Enquiry Terms */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Enquiry Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-gray-400 block">Requested Volume</span>
                    <strong className="text-gray-900 font-semibold">
                      {activeEnquiry.requestedQuantity} {activeEnquiry.unitRequested || activeEnquiry.unit || "kg"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Grade</span>
                    <strong className="text-gray-900 font-semibold">
                      {activeEnquiry.grade || "Grade A (Premium)"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Delivery Location</span>
                    <strong className="text-gray-900 font-semibold">
                      {activeEnquiry.deliveryLocation || "Tamil Nadu"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Communication Thread
                </h4>

                <div className="space-y-2.5">
                  {Array.isArray(activeEnquiry.messages) &&
                    activeEnquiry.messages.map((msg, idx) => {
                      const isBuyerMsg = msg.senderRole === "BUYER";
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border ${
                            isBuyerMsg
                              ? "bg-[#EAF5ED]/70 border-emerald-200 ml-4 sm:ml-8"
                              : "bg-white border-gray-200 mr-4 sm:mr-8 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-1.5">
                            <span className="font-bold text-gray-900">
                              {isBuyerMsg ? "You (Buyer)" : msg.senderName || activeEnquiry.sellerName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {msg.formattedTime ||
                                new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-xs">{msg.message}</p>
                          {msg.quotedPrice && (
                            <div className="mt-2 p-2 bg-emerald-100/70 rounded-lg text-[11px] font-bold text-[#174B35]">
                              Quoted Price: Rs {msg.quotedPrice} per {msg.unit || "kg"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Follow-up reply box */}
              {activeEnquiry.status !== "CLOSED" ? (
                <form onSubmit={handleSendFollowUp} className="space-y-2.5 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-800">
                    Send Follow-up Message to Supplier:
                  </label>
                  {replyError && (
                    <div className="text-xs text-red-600 font-semibold">{replyError}</div>
                  )}
                  <textarea
                    rows={2}
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Type your reply, negotiate price, or confirm dispatch schedule..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleCloseEnquiry}
                      className="text-xs text-gray-400 hover:text-red-600 hover:underline cursor-pointer"
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
                  This enquiry thread has been closed.
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedSupplierForModal({
                    id: activeEnquiry.sellerId,
                    name: activeEnquiry.sellerName,
                    district: activeEnquiry.sellerDistrict || "Tamil Nadu",
                    sellerType: "Verified Producer",
                    verified: true,
                  });
                }}
                className="text-xs font-bold text-[#174B35] hover:underline cursor-pointer"
              >
                View Seller Profile &rarr;
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

      {/* Mobile Bottom Navigation */}
      <BottomTabBar />

      {/* Supporting Modals */}
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
