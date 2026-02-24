import { generatePageMetadata, generateBreadcrumbJsonLd, generateLocalBusinessJsonLd, generateFAQJsonLd } from "@/lib/seo";
import BlogPostLayout from "@/components/blog/BlogPostLayout";
import { metadata as postMeta, tableOfContents, faqs, sections } from "@/content/local-pages/las-vegas-med-spa-aeo.js";

export const metadata = generatePageMetadata({
  title: postMeta.title,
  description: postMeta.description,
  path: "/las-vegas-med-spa-aeo",
  keywords: postMeta.keywords,
});

export default function Page() {
  const jsonLd = [
    generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: postMeta.title },
    ]),
    generateLocalBusinessJsonLd({
      name: "First Answer — Med Spa AEO Services",
      description: postMeta.description,
      url: "/las-vegas-med-spa-aeo",
      areaServed: "Las Vegas",
      serviceType: "Answer Engine Optimization",
    }),
  ];
  if (faqs?.length) jsonLd.push(generateFAQJsonLd(faqs));

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <BlogPostLayout
        metadata={postMeta}
        tableOfContents={tableOfContents}
        faqs={faqs}
        sections={sections}
        relatedPosts={[]}
      />
    </>
  );
}
