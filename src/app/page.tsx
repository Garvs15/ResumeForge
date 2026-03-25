import { Background } from "@/components/landing/Background";
import { CreatorStory } from "@/components/landing/CreatorStory";
import { FAQ } from "@/components/landing/FAQ";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import { Hero } from "@/components/landing/Hero";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ResumeForge - AI Resume Builder for the Tech Jobs",
  description: "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  twitter: {
    title: "ResumeForge - AI Resume Builder for Tech Jobs",
    description: "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  }
};

export default async function Page() {
  // Check if the user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If the user is authenticated, redirect to home page
  if (user) {
    redirect("/home");
  }

  return (
    <>
      <main aria-label="ResumeForge landing page" className="">
        {/* Simplified Navigation */}
        <nav aria-label="Main navigation" className="border-b border-gray-200 fixed top-0 w-full bg-white/95 z-[1000] transition-all duration-300 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <NavLinks />
            </div>
          </div>
        </nav>

        {/* Background Component */}
        <Background />

        {/* Main Content */}
        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-24 flex flex-col justify-center">
          {/* Hero Section */}
          <Hero />
        </div>

        {/* Video Showcase Section */}
        <section id="product-demo">
          <VideoShowcase />
        </section>

        {/* Feature Highlights Section */}
        <section id="features" aria-labelledby="features-heading" className="">
          <FeatureHighlights />
        </section>

        {/* Creator Story Section */}
        <section id="about" aria-labelledby="about-heading" className="">
          <CreatorStory />
        </section>

        {/* Pricing Plans Section */}
        <section id="pricing" aria-labelledby="pricing-heading" className="">
          <PricingPlans />
        </section>

        {/* FAQ Section */}
        <FAQ />

      </main>
    </>
  );
}
