import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import VideoShowcaseSection from "@/components/landing/VideoShowcaseSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#263329] flex flex-col selection:bg-[#E8F0E3] selection:text-[#174B35]">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {/* Main Page Content Flow */}
      <main className="flex-1">
        {/* 2. Hero Section: Cinematic Agricultural Video Background */}
        <HeroSection />

        {/* 3. Introduction / About Ulavan Santhai */}
        <AboutSection />

        {/* 4. Who We Connect (4 Premium Audience Cards) */}
        <AudienceSection />

        {/* 5. How It Works (4 Clear Progressive Steps) */}
        <HowItWorksSection />

        {/* 6. Explore Agricultural Categories (6 Distinct Produce Cards) */}
        <CategoriesSection />

        {/* 7. Why Choose Ulavan Santhai? (Split Section with Value Pillars) */}
        <WhyChooseUsSection />

        {/* 8. Visual Break / Agricultural Video Strip */}
        <VideoShowcaseSection />

        {/* 9. Final Call to Action */}
        <FinalCTASection />
      </main>

      {/* 10. Professional Marketplace Footer */}
      <Footer />
    </div>
  );
}
