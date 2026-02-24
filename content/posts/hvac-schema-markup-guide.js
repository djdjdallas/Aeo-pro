// Supporting post: HVAC Schema Markup Guide
// Pillar: aeo-for-hvac-companies

export const metadata = {
  slug: "hvac-schema-markup-guide",
  title: "HVAC Schema Markup Guide: Boost Your AI Search Visibility",
  description:
    "Learn exactly which schema markup types HVAC businesses need to appear in ChatGPT, Perplexity, and AI Overviews. Step-by-step implementation guide.",
  keywords: [
    "HVAC schema markup",
    "HVAC structured data",
    "schema markup for HVAC",
    "HVAC JSON-LD",
    "HVAC business schema",
    "AI search schema HVAC",
  ],
  author: {
    name: "The First Answer Team",
    role: "AEO Specialists at First Answer",
  },
  date: "2025-02-23",
  lastModified: "2025-02-23",
  category: "industry",
  industry: "hvac",
  readingTime: "8 min",
  wordCount: 1500,
  pillarSlug: "aeo-for-hvac-companies",
  supportingSlugs: [],
  relatedSlugs: [
    "aeo-for-hvac-companies",
    "what-is-schema-markup-local-business",
    "why-your-hvac-business-isnt-on-chatgpt",
  ],
  schema: { type: "Article", hasFAQ: true },
};

export const tableOfContents = [
  { id: "why-schema-matters-hvac", label: "Why Schema Matters for HVAC" },
  { id: "service-schema", label: "Service Schema for HVAC" },
  { id: "area-served-schema", label: "Area Served Schema" },
  { id: "implementation", label: "Implementation Steps" },
  { id: "testing", label: "Testing and Validation" },
];

export const faqs = [
  {
    question: "What schema markup does an HVAC business need?",
    answer:
      "At minimum, HVAC businesses need HVACBusiness schema (a subtype of LocalBusiness), Service schema for each service offered, areaServed schema defining your coverage zones, AggregateRating schema for reviews, and OpeningHoursSpecification for availability. Each schema type feeds different AI data needs.",
  },
  {
    question: "Does schema markup directly improve AI search rankings?",
    answer:
      "Schema markup does not work like a traditional ranking factor. Instead, it provides the structured data that AI models require to understand and recommend your business. Without schema, AI has to interpret unstructured text — and it frequently gets it wrong or skips you entirely.",
  },
  {
    question: "Can I add schema markup to my HVAC website myself?",
    answer:
      "Basic schema can be added manually using JSON-LD scripts in your page headers. However, HVAC-specific schema requires knowledge of the correct types, properties, and nesting. Errors in schema can be worse than no schema at all, as they send conflicting signals to AI models.",
  },
  {
    question: "How often should I update my HVAC schema markup?",
    answer:
      "Update your schema whenever your business information changes — new services, updated hours, new service areas, or fresh review counts. At minimum, audit your schema quarterly to ensure it accurately reflects your current operations.",
  },
];

export const sections = [
  {
    type: "intro",
    content:
      "Schema markup is the language AI understands. While your website speaks to humans with images, testimonials, and sales copy, AI models like ChatGPT and Perplexity read structured data to decide which businesses to recommend. For HVAC companies, the right schema markup is the difference between being the first recommendation and being completely absent from AI search results. This guide covers every schema type your HVAC business needs and exactly how to implement each one.",
  },
  {
    type: "heading",
    id: "why-schema-matters-hvac",
    content: "Why Schema Markup Matters for HVAC Businesses",
  },
  {
    type: "answer-capsule",
    content:
      "Schema markup translates your HVAC business information into structured data that AI models can read, verify, and use for recommendations. Without it, AI engines must guess what services you offer, where you operate, and whether you are trustworthy — and they rarely guess in your favor.",
  },
  {
    type: "body",
    content:
      '<p>When a homeowner asks ChatGPT for an HVAC recommendation, the AI does not browse your website like a human would. It pulls from structured data feeds, knowledge graphs, and verified business information. Schema markup is how you feed that machine directly.</p><p>HVAC is a particularly schema-dependent industry because of the specificity involved. You do not just offer \"HVAC services\" — you offer AC repair, furnace installation, duct cleaning, heat pump maintenance, and emergency service. Each of these needs its own structured data entry for AI to match you to the right queries.</p><p>Without schema, you are relying on AI to parse your unstructured web pages and figure out what you do. That is a gamble you will lose. For the full picture of HVAC AI optimization, see our <a href="/blog/aeo-for-hvac-companies">complete AEO guide for HVAC companies</a>.</p>',
  },
  {
    type: "heading",
    id: "service-schema",
    content: "Service Schema for HVAC Companies",
  },
  {
    type: "body",
    content:
      "<p>Service schema is the most critical structured data type for HVAC businesses. It tells AI exactly what services you provide, with enough detail for the AI to match you to specific homeowner queries.</p><p>Each HVAC service should have its own Service schema entry with these properties:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>@type: Service</strong> — defines the entry as a service offering",
      "<strong>name</strong> — the specific service name, such as \"Central Air Conditioning Repair\" or \"Gas Furnace Installation\"",
      "<strong>description</strong> — a 50-100 word description of what the service includes",
      "<strong>provider</strong> — links back to your HVACBusiness schema entry",
      "<strong>areaServed</strong> — the geographic areas where this service is available",
      "<strong>hasOfferCatalog</strong> — optional but powerful, lets you list specific sub-services and pricing tiers",
      "<strong>serviceType</strong> — categorizes the service (e.g., \"Repair\", \"Installation\", \"Maintenance\")",
    ],
  },
  {
    type: "body",
    content:
      "<p>Do not make the mistake of creating one generic Service schema entry for all HVAC services. AI models reward specificity. A homeowner asking about \"furnace repair\" should be matched to your furnace repair schema, not a generic HVAC services entry. Create individual Service schema for every major service you offer.</p>",
  },
  {
    type: "callout",
    title: "Pro Tip: Seasonal Services",
    content:
      "Add temporalCoverage or availability properties to seasonal HVAC services. Mark AC services as peak spring/summer and heating services as fall/winter. AI models use temporal data to prioritize recommendations based on when the query is made.",
  },
  {
    type: "heading",
    id: "area-served-schema",
    content: "Area Served Schema: Owning Your Territory",
  },
  {
    type: "body",
    content:
      "<p>Location-based queries are the lifeblood of HVAC businesses, and areaServed schema is how you claim your territory in AI search. Without it, AI has no structured way to know if you serve a particular zip code, city, or county.</p><p>There are three ways to define your service area in schema:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>City-level</strong> — define each city you serve as a separate Place entity with name and geo coordinates",
      "<strong>County or region-level</strong> — use AdministrativeArea for broader coverage zones",
      "<strong>Radius-based</strong> — use GeoCircle with a center point and radius in miles or kilometers",
    ],
  },
  {
    type: "body",
    content:
      "<p>For most HVAC businesses, a combination of city-level and county-level areaServed entries works best. List every city and town you serve individually, then wrap them in a broader regional definition. This gives AI the specificity to match you to \"HVAC repair in [specific town]\" queries while also capturing broader \"HVAC near me\" searches.</p><p>Do not limit yourself to your primary city. If you serve 15 surrounding towns, every one of them needs to be in your areaServed schema. Each missing city is a missed opportunity for AI to recommend you.</p>",
  },
  {
    type: "heading",
    id: "implementation",
    content: "Step-by-Step Implementation Guide",
  },
  {
    type: "body",
    content:
      "<p>Implementing HVAC schema markup follows a specific order. Rushing ahead without the foundation in place creates errors that can hurt more than help.</p>",
  },
  {
    type: "list",
    items: [
      "<strong>Step 1: HVACBusiness base schema</strong> — Add this to your homepage. Include business name, address, phone, logo, URL, opening hours, and payment methods accepted.",
      "<strong>Step 2: Service schema on service pages</strong> — Each service page gets its own Service schema entry with the properties listed above. Link each back to your HVACBusiness entity.",
      "<strong>Step 3: areaServed on all relevant pages</strong> — Add area served data to your homepage, service pages, and any location-specific pages.",
      "<strong>Step 4: AggregateRating schema</strong> — Add your review rating and count. Keep this updated monthly at minimum.",
      "<strong>Step 5: FAQ schema on content pages</strong> — If you have FAQ sections or Q&A content, wrap them in FAQPage schema to capture question-based AI queries.",
      "<strong>Step 6: Emergency service indicators</strong> — If you offer 24/7 or emergency HVAC service, add OpeningHoursSpecification with \"Mo-Su 00:00-23:59\" and mark isAcceptingNewPatients or similar availability flags.",
    ],
  },
  {
    type: "body",
    content:
      '<p>All schema should be implemented in JSON-LD format, placed in the <code>&lt;head&gt;</code> section of each page. Do not use Microdata or RDFa — JSON-LD is the format Google, Bing, and AI models prefer and process most reliably.</p>',
  },
  {
    type: "heading",
    id: "testing",
    content: "Testing and Validation",
  },
  {
    type: "body",
    content:
      "<p>Implementing schema is only half the job. Untested schema can contain errors that make it worse than having no schema at all. Here is the validation process every HVAC business should follow after implementation:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>Google Rich Results Test</strong> — Run every page through Google's testing tool to verify your schema is valid and eligible for rich results",
      "<strong>Schema.org Validator</strong> — Use the official validator to check for syntax errors and missing required properties",
      "<strong>Manual AI testing</strong> — After implementation, ask ChatGPT and Perplexity about your services in your area. Track whether you start appearing in responses",
      "<strong>Search Console monitoring</strong> — Check Google Search Console's Enhancement reports for schema errors and warnings",
      "<strong>Quarterly audits</strong> — Review all schema every three months to ensure accuracy as your business evolves",
    ],
  },
  {
    type: "body",
    content:
      '<p>Schema markup is not a set-it-and-forget-it task. As you add services, expand service areas, or accumulate more reviews, your schema needs to reflect those changes. The HVAC businesses that maintain their structured data consistently will maintain their AI visibility advantage.</p><p>For the broader strategy that schema supports, read our complete guide: <a href="/blog/aeo-for-hvac-companies">AEO for HVAC Companies</a>.</p>',
  },
  {
    type: "cta-inline",
    content: "Get Your Free HVAC Schema Audit",
  },
];
