import DashboardHero from "@/components/sections/DashboardHero";
import TrustBar from "@/components/sections/TrustBar";
import WhatsChanging from "@/components/sections/WhatsChanging";
import WhoItsFor from "@/components/sections/WhoItsFor";
import HowItWorks from "@/components/sections/HowItWorks";
import MonitoringDifference from "@/components/sections/MonitoringDifference";
import MidPageCTA from "@/components/sections/MidPageCTA";
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
    "Done-for-you AEO for local businesses. We get you recommended by ChatGPT, Perplexity, and every AI assistant your customers use.",
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
      <DashboardHero />
      <main>
        <TrustBar />
        <WhatsChanging />
        <WhoItsFor />
        <HowItWorks />
        <MonitoringDifference />
        <MidPageCTA />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
