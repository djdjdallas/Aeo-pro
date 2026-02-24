import {
  generatePageMetadata,
  generateSoftwareApplicationJsonLd,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd,
} from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Free AI Visibility Audit",
  description:
    "See how your website performs in AI-powered search engines. Get a free audit covering schema markup, content structure, citation presence, and AI readiness.",
  path: "/audit",
  keywords: [
    "AI visibility audit",
    "AEO audit",
    "AI search audit",
    "schema markup checker",
    "answer engine optimization audit",
  ],
});

const auditFaqs = [
  {
    question: "What does the AI Visibility Audit check?",
    answer:
      "The audit analyzes your website's schema markup, content structure, citation presence across AI platforms, and overall readiness for AI-powered search engines like ChatGPT and Perplexity.",
  },
  {
    question: "Is the audit really free?",
    answer:
      "Yes, the AI Visibility Audit is completely free with no strings attached. Enter any URL and get a detailed report in under 60 seconds.",
  },
  {
    question: "How can I improve my audit score?",
    answer:
      "Focus on adding structured data (JSON-LD schema), building citations on authoritative sources, optimizing content for question-and-answer formats, and ensuring your Google Business Profile is complete.",
  },
];

const softwareAppJsonLd = generateSoftwareApplicationJsonLd();
const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: "Home", url: "/" },
  { name: "AI Visibility Audit" },
]);
const faqJsonLd = generateFAQJsonLd(auditFaqs);

export default function AuditLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
