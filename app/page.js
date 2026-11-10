import ReferenceContent from "@/components/reference-home/ReferenceContent";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import ReferencePlans from "@/components/reference-home/ReferencePlans";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Link from "next/link";
import "@/components/reference-home/reference.css";
import "@/components/reference-home/navbar.css";

export const metadata = {
 title:"Ulavan Santhai — From seed to opportunity",
 description:"Discover agricultural products, find suppliers and connect with your next buyer on Ulavan Santhai.",
};
export default function LandingPage() {
 return <>
  <div className="reference-home"><ReferenceContent /></div>
  <main className="marketplace-sections">
   <AboutSection /><AudienceSection /><HowItWorksSection /><CategoriesSection /><WhyChooseUsSection /><ReferencePlans /><FinalCTASection />
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
