import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutAEO from "@/components/sections/AboutAEO";
import ResultsSnapshot from "@/components/sections/ResultsSnapshot";
import Timeline from "@/components/sections/Timeline";
import WhoItsFor from "@/components/sections/WhoItsFor";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import {
  generateServiceJsonLd,
  generateFAQJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { homepageFaqs, pricingPlans } from "@/lib/homepage-data";

const serviceJsonLd = generateServiceJsonLd({
  name: "Answer Engine Optimization (AEO)",
  description:
    "Get your local business recommended by ChatGPT, Perplexity, and every AI assistant your customers use.",
  offers: pricingPlans,
});

const faqJsonLd = generateFAQJsonLd(homepageFaqs);

const breadcrumbJsonLd = generateBreadcrumbJsonLd([{ name: "Home", url: "/" }]);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <AboutAEO />
        <ResultsSnapshot />
        <Timeline />
        <WhoItsFor />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
