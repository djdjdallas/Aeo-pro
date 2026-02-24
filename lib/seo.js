const SITE_URL = "https://firstanswer.co";
const SITE_NAME = "First Answer";

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
      siteName: SITE_NAME,
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
      siteName: SITE_NAME,
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
      name: SITE_NAME,
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
