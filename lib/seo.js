const SITE_URL = "https://firstanswer.co";
const SITE_NAME = "First Answer";
const SITE_NAME_BRANDED = "First Answer — AEO for Local Businesses";

/**
 * Generate metadata for a blog article page.
 */
export function generateArticleMetadata(post) {
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME_BRANDED,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.lastModified,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

/**
 * Generate metadata for a static page (local pages, listing pages).
 */
export function generatePageMetadata({ title, description, path, keywords }) {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME_BRANDED,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}${path}`,
    },
  };
}

/**
 * Generate Article JSON-LD structured data.
 */
export function generateArticleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME_BRANDED,
      url: SITE_URL,
    },
    datePublished: post.date,
    dateModified: post.lastModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    wordCount: post.wordCount,
  };
}

/**
 * Generate FAQPage JSON-LD structured data.
 */
export function generateFAQJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList JSON-LD structured data.
 */
export function generateBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

/**
 * Generate LocalBusiness JSON-LD structured data.
 */
export function generateLocalBusinessJsonLd({
  name,
  description,
  url,
  areaServed,
  serviceType,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    description,
    url: `${SITE_URL}${url}`,
    areaServed: {
      "@type": "City",
      name: areaServed,
    },
    serviceType,
  };
}

/**
 * Generate Organization JSON-LD — appears on every page via root layout.
 * Fully populated with NAP, founder, and social/directory sameAs links.
 * AI models use this to verify business identity before recommending.
 */
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME_BRANDED,
    url: SITE_URL,
    description:
      "Answer Engine Optimization for local businesses. Get your business recommended by ChatGPT, Perplexity, and every AI assistant your customers use.",
    telephone: "+1-424-288-0215",
    email: "hello@firstanswer.co",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Las Vegas",
      addressRegion: "NV",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "State", name: "Nevada" },
      { "@type": "Country", name: "United States" },
    ],
    founder: {
      "@type": "Person",
      name: "Dom Dallas",
      url: SITE_URL,
    },
    foundingDate: "2024",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 1,
    },
    knowsAbout: [
      "Answer Engine Optimization",
      "AI Search Visibility",
      "Local Business Marketing",
      "Schema Markup",
      "ChatGPT Recommendations",
      "Perplexity Citations",
    ],
    sameAs: [
      // TODO: Add real URLs as you build these out
      // "https://www.linkedin.com/company/firstanswer",
      // "https://twitter.com/firstanswer_co",
      // "https://www.google.com/maps?cid=YOUR_CID",
      // "https://www.yelp.com/biz/first-answer",
      // "https://clutch.co/profile/first-answer",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AEO Services",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Starter AEO",
          price: "500",
          priceCurrency: "USD",
          description: "Foundation AEO package for local businesses",
        },
        {
          "@type": "Offer",
          name: "Growth AEO",
          price: "1000",
          priceCurrency: "USD",
          description: "Advanced AEO with citation building and monitoring",
        },
        {
          "@type": "Offer",
          name: "Pro AEO",
          price: "1500",
          priceCurrency: "USD",
          description: "Full-service AEO with bi-weekly strategy calls",
        },
      ],
    },
  };
}

/**
 * Generate WebSite JSON-LD with SearchAction — appears on every page via root layout.
 */
export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME_BRANDED,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Service JSON-LD with Offers — used on homepage.
 */
export function generateServiceJsonLd({ name, description, offers }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME_BRANDED,
      url: SITE_URL,
    },
    offers: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: "USD",
      description: offer.description,
    })),
  };
}

/**
 * Generate SoftwareApplication JSON-LD — used on audit page.
 */
export function generateSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Visibility Audit",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free AI visibility audit tool. See how your website performs in AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews.",
    provider: {
      "@type": "Organization",
      name: SITE_NAME_BRANDED,
      url: SITE_URL,
    },
  };
}

/**
 * Generate CollectionPage + ItemList JSON-LD — used on blog listing page.
 */
export function generateBlogListingJsonLd(posts) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME_BRANDED} Blog`,
    description:
      "Expert guides on Answer Engine Optimization (AEO). Learn how to get your business recommended by ChatGPT, Perplexity, and AI search engines.",
    url: `${SITE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}
