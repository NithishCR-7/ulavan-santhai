"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How does the Ulavan Santhai B2B enquiry model work?",
    a: "Ulavan Santhai is an enquiry-based agricultural marketplace. Instead of an automated e-commerce checkout with consumer carts and shipping calculators, buyers submit direct commercial quotations and specifications to verified Tamil Nadu farmers and FPOs.",
  },
  {
    q: "How does my 10-seller access plan work?",
    a: "Your initial membership includes unlocking full contact details (phone, WhatsApp desk, email) for up to 10 unique suppliers. Once unlocked, a supplier remains permanently unlocked for you — returning to view their details consumes 0 views.",
  },
  {
    q: "What happens when I exhaust all 10 seller views?",
    a: "Under BRD Rule 10.4, you can top-up additional supplier access in blocks of 10 verified sellers for ₹10. You will also continue to receive responses from suppliers you have previously enquired with.",
  },
  {
    q: "How do I track responses to my enquiries?",
    a: "Navigate to 'My Enquiries' from the top header or mobile bottom bar. Every quotation, batch specification, and message thread is tracked chronologically under Sent, Seen, Responded, or Closed statuses.",
  },
  {
    q: "Why are producer land documents not visible?",
    a: "Sensitive government identity and land ownership documents uploaded during onboarding are strictly verified by our administrative inspection team and kept confidential under privacy guidelines.",
  },
];

export default function HelpModal({ isOpen, onClose }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject("");
      setTicketMessage("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Support Desk</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Help &amp; Support Centre
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Frequently asked questions, seller quota rules, and direct trader support.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* FAQ Accordion */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Frequently Asked Questions
            </h4>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpenFaq = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpenFaq ? -1 : idx)}
                      className="w-full p-3.5 text-left text-xs font-bold text-gray-900 flex items-center justify-between gap-3 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <span className="text-gray-400 text-base">{isOpenFaq ? "−" : "+"}</span>
                    </button>
                    {isOpenFaq && (
                      <div className="p-3.5 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-emerald-50/30">
            <h4 className="text-sm font-bold text-[#174B35] mb-1">
              Need assistance from our Trade Desk?
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Our regional Tamil Nadu agricultural support team is available Mon-Sat, 9 AM - 6 PM.
            </p>

            {ticketSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center">
                ✓ Your inquiry has been submitted. Our trade desk will respond within 4 business hours.
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Subject: e.g. Issue with seller contact verification"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
                <textarea
                  required
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send to Support Desk
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

