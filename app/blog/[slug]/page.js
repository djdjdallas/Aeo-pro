import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/content";
import { generateArticleMetadata, generateArticleJsonLd, generateFAQJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return generateArticleMetadata(post.metadata);
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug);

  const jsonLd = [
    generateArticleJsonLd(post.metadata),
    generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.metadata.title },
    ]),
  ];

  if (post.faqs && post.faqs.length > 0) {
    jsonLd.push(generateFAQJsonLd(post.faqs));
  }

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <BlogPostLayout
        metadata={post.metadata}
        tableOfContents={post.tableOfContents}
        faqs={post.faqs}
        sections={post.sections}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
