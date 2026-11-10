import ReferenceContent from "@/components/reference-home/ReferenceContent";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import ReferencePlans from "@/components/reference-home/ReferencePlans";
import FinalCTASection from "@/components/landing/FinalCTASection";
import MarketplaceFooter from "@/components/landing/MarketplaceFooter";
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
  <MarketplaceFooter />
 </>;
}
