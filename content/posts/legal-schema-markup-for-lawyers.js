// Supporting post: Legal Schema Markup for Lawyers
// Pillar: aeo-for-personal-injury-lawyers

export const metadata = {
  slug: "legal-schema-markup-for-lawyers",
  title: "Legal Schema Markup for Lawyers: A Complete Implementation Guide",
  description:
    "Complete guide to implementing legal schema markup for law firms. Learn Attorney, LegalService, and practice area schema to boost AI search visibility.",
  keywords: [
    "legal schema markup",
    "attorney schema",
    "law firm structured data",
    "lawyer JSON-LD",
    "legal service schema",
    "law firm schema markup",
  ],
  author: {
    name: "The First Answer Team",
    role: "AEO Specialists at First Answer",
  },
  date: "2025-02-23",
  lastModified: "2025-02-23",
  category: "industry",
  industry: "legal",
  readingTime: "8 min",
  wordCount: 1500,
  pillarSlug: "aeo-for-personal-injury-lawyers",
  supportingSlugs: [],
  relatedSlugs: [
    "aeo-for-personal-injury-lawyers",
    "why-your-law-firm-missing-ai-overviews",
    "what-is-schema-markup-local-business",
  ],
  schema: { type: "Article", hasFAQ: true },
};

export const tableOfContents = [
  { id: "why-legal-schema", label: "Why Legal Schema Matters" },
  { id: "attorney-schema", label: "Attorney Schema Markup" },
  { id: "practice-area-markup", label: "Practice Area Markup" },
  { id: "case-results", label: "Case Results Schema" },
  { id: "implementation", label: "Implementation Guide" },
];

export const faqs = [
  {
    question: "What schema markup does a law firm need?",
    answer:
      "Law firms need LegalService or Attorney schema as their base, Person schema for each attorney with credentials and bar admissions, Service schema for each practice area, AggregateRating schema for reviews, and FAQPage schema for legal Q&A content. Each schema type serves a specific purpose in AI visibility.",
  },
  {
    question: "Is Attorney schema different from LocalBusiness schema?",
    answer:
      "Yes. Attorney schema is a specialized subtype of LocalBusiness that includes legal-specific properties. Using generic LocalBusiness schema tells AI you are a business but not specifically a law firm, which means you miss legal-specific AI queries. Always use the most specific schema type available.",
  },
  {
    question: "How does schema markup help my law firm appear in AI search?",
    answer:
      "Schema markup provides AI models with structured, machine-readable data about your firm, attorneys, and services. Without schema, AI must interpret unstructured text and often gets details wrong or skips your firm entirely. Schema removes the guesswork and feeds AI exactly what it needs to recommend you.",
  },
  {
    question: "Should each attorney have their own schema markup?",
    answer:
      "Absolutely. Each attorney should have Person schema on their bio page that includes their name, job title, education, bar admissions, practice areas, and professional affiliations. This allows AI to match individual attorneys to specific legal queries and verify their credentials.",
  },
];

export const sections = [
  {
    type: "intro",
    content:
      "AI search engines do not read your law firm website the way a potential client does. They scan for structured data — machine-readable code that definitively states who you are, what you practice, and why you should be trusted. Without the right schema markup, your decades of legal experience, your landmark case results, and your five-star reviews are invisible to the algorithms deciding which firms to recommend. This guide covers every schema type your law firm needs and provides a clear implementation path.",
  },
  {
    type: "heading",
    id: "why-legal-schema",
    content: "Why Legal Schema Markup Is Non-Negotiable",
  },
  {
    type: "answer-capsule",
    content:
      "Legal schema markup converts your law firm's credentials, practice areas, and case results into structured data that AI models can verify and cite. In YMYL categories like legal services, AI will not recommend firms it cannot verify — and schema is the primary verification mechanism.",
  },
  {
    type: "body",
    content:
      '<p>The legal industry operates under Google\'s strictest quality guidelines. YMYL (Your Money or Your Life) classification means AI applies extra scrutiny before citing any law firm. This is where schema markup becomes your firm\'s most powerful tool — it provides the verifiable, structured proof that AI demands before making a recommendation.</p><p>Consider what happens without schema: AI encounters your website and finds text that says you are a personal injury firm in Chicago. But it cannot programmatically verify your attorneys\' bar admissions, it cannot distinguish your practice areas from generic marketing copy, and it has no structured way to evaluate your case results. So it moves on to a firm that provides this data in a format it can consume.</p><p>Our <a href="/blog/aeo-for-personal-injury-lawyers">AEO guide for personal injury lawyers</a> covers the full strategy, but schema markup is the technical foundation everything else builds upon.</p>',
  },
  {
    type: "heading",
    id: "attorney-schema",
    content: "Attorney Schema: Your Firm's Digital Credentials",
  },
  {
    type: "body",
    content:
      "<p>Attorney schema serves two purposes: it identifies your firm as a legal practice (not just a generic business), and it provides detailed credential information that AI uses to evaluate trustworthiness.</p><p>Your firm-level schema should use the Attorney or LegalService type and include these essential properties:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>@type: Attorney</strong> or <strong>LegalService</strong> — the most specific business type for law firms",
      "<strong>name</strong> — your full firm name exactly as it appears on your bar registration",
      "<strong>address</strong> — complete physical address with PostalAddress schema",
      "<strong>telephone</strong> — primary phone number in consistent format",
      "<strong>url</strong> — your firm's website URL",
      "<strong>openingHours</strong> — office hours and availability for consultations",
      "<strong>areaServed</strong> — jurisdictions and geographic areas where you practice",
      "<strong>knowsAbout</strong> — practice areas and legal specialties",
      "<strong>hasCredential</strong> — bar admissions, board certifications, and professional designations",
    ],
  },
  {
    type: "body",
    content:
      "<p>Individual attorney pages need Person schema that nests within your firm's Attorney schema. Each attorney's Person schema should include their full name, job title, educational background (law school, degrees), bar admissions by state, practice area specialties, years of experience, and links to their bar association profiles.</p><p>This level of detail may seem excessive, but it is exactly what AI models need to verify attorney credentials for YMYL legal queries. Firms that provide this data get recommended. Firms that do not get skipped.</p>",
  },
  {
    type: "callout",
    title: "Bar Admission Schema",
    content:
      "Include your bar admission details using the hasCredential property with EducationalOccupationalCredential. Specify the credentialCategory as \"Bar Admission,\" the recognizedBy organization (the specific state bar), and the date issued. This is one of the strongest trust signals for legal AI queries.",
  },
  {
    type: "heading",
    id: "practice-area-markup",
    content: "Practice Area Markup That AI Actually Uses",
  },
  {
    type: "body",
    content:
      "<p>Each practice area your firm handles needs its own Service schema entry. Generic practice area listings are useless to AI — it needs structured, specific service definitions to match your firm to the right queries.</p><p>For a personal injury firm, this means separate Service schema entries for:</p>",
  },
  {
    type: "list",
    items: [
      "Car accident cases — with description covering types of auto collisions handled",
      "Truck accident litigation — specifying commercial vehicle and 18-wheeler cases",
      "Slip and fall claims — detailing premises liability expertise",
      "Medical malpractice — including types of medical negligence handled",
      "Wrongful death — specifying the types of fatal accident cases",
      "Workers' compensation — covering workplace injury claim experience",
    ],
  },
  {
    type: "body",
    content:
      '<p>Each Service schema entry should include a detailed description, the geographic area where you handle these cases, and any notable results or experience indicators. Do not copy and paste the same description across practice areas — AI detects duplicate content and devalues it. Each entry needs unique, substantive content that reflects your genuine expertise in that specific area.</p>',
  },
  {
    type: "heading",
    id: "case-results",
    content: "Case Results: The Trust Signal AI Cannot Ignore",
  },
  {
    type: "body",
    content:
      "<p>Published case results with structured data are one of the most powerful signals a law firm can send to AI models. They demonstrate real-world experience that no amount of marketing copy can replicate.</p><p>While there is no official schema.org type for case results, you can effectively structure this data using a combination of approaches:</p>",
  },
  {
    type: "list",
    items: [
      "Use <strong>ItemList</strong> schema to create a structured collection of notable case outcomes",
      "Each list item should include the case type, outcome amount or result, and a brief description",
      "Add <strong>datePublished</strong> to show recency of results",
      "Include practice area categorization so AI can match results to specific query types",
      "Add appropriate legal disclaimers as part of the structured data description",
    ],
  },
  {
    type: "body",
    content:
      "<p>Case results serve a dual purpose: they satisfy AI's need for experience verification under YMYL guidelines, and they provide the kind of specific, factual data that AI models prefer to cite. A firm that has published 50 structured case results with outcome data sends a dramatically stronger signal than a firm with a generic \"Results\" page listing a few bullet points.</p>",
  },
  {
    type: "heading",
    id: "implementation",
    content: "Implementation Guide: Priority Order",
  },
  {
    type: "body",
    content:
      "<p>Implementing legal schema markup should follow a specific sequence to avoid errors and maximize impact:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>Phase 1: Foundation</strong> — Implement Attorney/LegalService schema on your homepage with complete business details, contact information, and practice area list",
      "<strong>Phase 2: Attorney profiles</strong> — Add Person schema to every attorney bio page with full credentials, education, bar admissions, and professional affiliations",
      "<strong>Phase 3: Practice areas</strong> — Create Service schema for each practice area page with unique descriptions and area served data",
      "<strong>Phase 4: Reviews and ratings</strong> — Add AggregateRating schema pulling from your Google, Avvo, and other review platforms",
      "<strong>Phase 5: Case results</strong> — Structure your case results with ItemList schema including outcome data and practice area categorization",
      "<strong>Phase 6: FAQ content</strong> — Wrap any legal Q&A content in FAQPage schema to capture question-based AI queries",
    ],
  },
  {
    type: "body",
    content:
      '<p>Use JSON-LD format exclusively. Place all schema in the <code>&lt;head&gt;</code> of each page. After implementation, validate every page using Google\'s Rich Results Test and the Schema.org Validator. Then monitor Google Search Console for enhancement reports showing any schema errors.</p><p>Schema implementation is the technical backbone of legal AI visibility. Combined with the content and authority strategies in our <a href="/blog/aeo-for-personal-injury-lawyers">complete AEO guide for personal injury lawyers</a>, it positions your firm to dominate AI search in your practice areas and jurisdiction.</p>',
  },
  {
    type: "cta-inline",
    content: "Get Your Free Legal Schema Audit",
  },
];
