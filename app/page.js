import AudienceSection from "@/components/landing/AudienceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AboutSection from "@/components/landing/AboutSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import VideoShowcaseSection from "@/components/landing/VideoShowcaseSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import PlansSection from "@/components/reference-home/ReferencePlans";
import Link from "next/link";
import ReferenceContent from "@/components/reference-home/ReferenceContent";

import "@/components/reference-home/reference.css";
import "@/components/reference-home/navbar.css";
export const metadata = { title: "Ulavan Santhai — From seed to opportunity", description: "Follow the journey from seed to opportunity. Ulavan Santhai connects agricultural sellers, business buyers, and households." };
export default function LandingPage() {
  return <>
    <div className="reference-home"><ReferenceContent /></div>
    <main className="marketplace-sections">
      <AboutSection />
      <AudienceSection />
      <HowItWorksSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <PlansSection />
      <VideoShowcaseSection />
      <FinalCTASection />
    </main>
    <footer id="contact" className="marketplace-footer">
      <div className="footer-grid">
        <div className="footer-intro"><Link href="#home" className="footer-brand">ULAVAN SANTHAI</Link><p>One marketplace for growers, suppliers and buyers. Find your next agricultural connection.</p><Link href="/register" className="footer-join">Join the community ↗</Link></div>
        <nav aria-label="Explore"><h3>Explore</h3><Link href="#about">About us</Link><Link href="#who-its-for">Our community</Link><Link href="#categories">Agricultural categories</Link></nav>
        <nav aria-label="Getting started"><h3>Get started</h3><Link href="#how-it-works">How it works</Link><Link href="#plans">Plans & access</Link><Link href="/register">Create an account</Link><Link href="/login">Login</Link></nav>
      </div>
      <div className="footer-bottom"><span>© 2026 Ulavan Santhai. All rights reserved.</span><Link href="#home">Back to top ↑</Link></div>
    </footer>
  </>;
}
