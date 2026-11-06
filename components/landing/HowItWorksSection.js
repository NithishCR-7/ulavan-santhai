"use client";

import { useEffect, useRef, useState } from "react";
import "./how-it-works.css";

const journeys = {
  buyer: [
    ["Create your account", "Sign up with your name, mobile number and email.", "Start with one account", "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80", "Person using a smartphone"],
    ["Set up your buyer profile", "Choose Individual or Business and fill in the details that apply to you.", "Tell us what you need", "/images/photographs/business-profile.jpg", "People reviewing information on a tablet"],
    ["Find products & suppliers", "After access is approved, explore produce and compare seller details and quantities.", "Find the right match", "/images/photographs/market-crates.jpg", "Fresh vegetables in market crates"],
    ["Send an enquiry", "Contact a seller to discuss availability, quantities and your requirements.", "Start a conversation", "/images/photographs/wholesale-market.jpg", "Agricultural workers sorting produce together"],
  ],
  seller: [
    ["Create your account", "Sign up with your name, mobile number and email.", "Start with one account", "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80", "Person using a smartphone"],
    ["Set up your seller profile", "Choose your business category and submit your details and verification documents.", "Submit for review", "/images/photographs/business-profile.jpg", "People reviewing information on a tablet"],
    ["Showcase your products", "Once your seller profile is approved, submit product details and photos for listing review.", "Help buyers discover you", "/images/photographs/farmer-harvest.jpg", "Farmer with freshly harvested vegetables"],
    ["Receive buyer enquiries", "Interested buyers contact you. Discuss their needs and build business connections.", "Turn interest into connections", "/images/photographs/produce-warehouse.jpg", "Worker sorting fresh fruit for distribution"],
  ],
};

export default function HowItWorksSection() {
  const [role, setRole] = useState("buyer");
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const section = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={section} id="how-it-works" className={`works-section${visible ? " works-visible" : ""}`} aria-labelledby="works-heading">
    <div className="works-wrap">
      <div className="works-heading">
        <h2 id="works-heading">How Ulavan Santhai Works</h2>
        <p>Looking to buy or ready to sell? See your next steps.</p>
        <div className="works-switch" role="group" aria-label="Choose your journey">
          <button type="button" aria-pressed={role === "buyer"} onClick={() => { setRole("buyer"); setActiveStep(0); }}>I want to buy</button>
          <button type="button" aria-pressed={role === "seller"} onClick={() => { setRole("seller"); setActiveStep(0); }}>I want to sell</button>
        </div>
        <p className="works-account-note">One account. You can be a buyer, a seller, or both.</p>
      </div>
      <div className="works-explainer">
        <div className="works-explainer-copy">
          <p className="works-demo-label">YOUR {role.toUpperCase()} JOURNEY · {activeStep + 1} OF 4</p>
          <h3>{journeys[role][activeStep][0]}</h3>
          <p>{journeys[role][activeStep][1]}</p>
          <div className="works-demo-tabs" role="group" aria-label="Explore each step">
            {journeys[role].map((step, index) => (
              <button
                type="button"
                key={`tab-${role}-${index}`}
                aria-pressed={activeStep === index}
                onClick={() => setActiveStep(index)}
              >
                <span>{index + 1}</span>
                {["Register", "Profile", role === "buyer" ? "Discover" : "List products", "Connect"][index]}
              </button>
            ))}
          </div>
          <button type="button" className="works-demo-next" onClick={() => setActiveStep((activeStep + 1) % 4)}>
            {activeStep === 3 ? "See the journey again" : "See the next step"} <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="works-demo-screen" key={`screen-${role}-${activeStep}`} aria-label="Illustration of this step">
          <div className="works-screen-bar">
            <span className="works-screen-dot" />
            <strong>Ulavan Santhai</strong>
            <span>Illustration</span>
          </div>
          <div className="works-scene">
            <div className={`works-scene-icon scene-${activeStep}`} aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {activeStep === 0 ? (
                  <g key="svg-0">
                    <rect x="15" y="8" width="34" height="48" rx="7" />
                    <path d="M25 16h14M27 48h10" />
                    <circle cx="32" cy="28" r="5" />
                    <path d="M23 41c0-9 18-9 18 0" />
                  </g>
                ) : activeStep === 1 ? (
                  <g key="svg-1">
                    <rect x="10" y="8" width="44" height="48" rx="6" />
                    <circle cx="25" cy="25" r="6" />
                    <path d="M17 40c0-8 16-8 16 0M38 23h8M38 30h8M18 48h28" />
                  </g>
                ) : activeStep === 2 ? (
                  <g key="svg-2">
                    <rect x="8" y="12" width="48" height="42" rx="5" />
                    <path d="M8 23h48M23 23v31M40 23v31M15 32h2m13 0h3m13 0h3M15 40h2m13 0h3m13 0h3" />
                    <path d="m27 10 5-5 5 5" />
                  </g>
                ) : (
                  <g key="svg-3">
                    <path d="M9 12h34a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H25L14 49v-8H9a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5Z" />
                    <path d="M20 49h19l10 7v-7h6a5 5 0 0 0 5-5V26a5 5 0 0 0-5-5M15 24h22M15 31h15" />
                  </g>
                )}
              </svg>
            </div>
            <strong>
              {[
                "Your account starts here",
                "Tell us about yourself",
                role === "buyer" ? "Find what you need" : "Show buyers what you supply",
                "A conversation creates a connection",
              ][activeStep]}
            </strong>
            <div className="works-scene-items">
              {(activeStep === 0
                ? ["Name & contact details", "Create your password"]
                : activeStep === 1
                ? [role === "buyer" ? "Individual or business buyer" : "Business category & documents", "Submit details for review"]
                : activeStep === 2
                ? [role === "buyer" ? "Products • quantities • suppliers" : "Photos • quantities • product details", role === "buyer" ? "Review listing information" : "Submit your listing for approval"]
                : [role === "buyer" ? "Ask about availability & quantity" : "Respond to interested buyers", "Discuss your requirements directly"]
              ).map((item, index) => (
                <div key={`item-${role}-${activeStep}-${index}`} style={{ "--item-delay": `${index * 160}ms` }}>
                  <span aria-hidden="true">{index ? "↗" : "✓"}</span>
                  {item}
                </div>
              ))}
            </div>
            <span className="works-scene-caption">{journeys[role][activeStep][2]}</span>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
