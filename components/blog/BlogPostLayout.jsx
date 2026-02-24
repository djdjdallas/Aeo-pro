import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import BlogHero from "./BlogHero";
import TableOfContents from "./TableOfContents";
import BlogFAQ from "./BlogFAQ";
import AuthorByline from "./AuthorByline";
import RelatedPosts from "./RelatedPosts";
import BlogCTA from "./BlogCTA";
import AnswerCapsule from "./AnswerCapsule";
import Link from "next/link";

function renderSection(section, i) {
  switch (section.type) {
    case "intro":
      return (
        <p key={i} className="text-lg text-gray-300 leading-relaxed">
          {section.content}
        </p>
      );
    case "heading":
      return (
        <h2 key={i} id={section.id}>
          {section.content}
        </h2>
      );
    case "subheading":
      return (
        <h3 key={i} id={section.id}>
          {section.content}
        </h3>
      );
    case "answer-capsule":
      return <AnswerCapsule key={i}>{section.content}</AnswerCapsule>;
    case "body":
      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: section.content }} />
      );
    case "callout":
      return (
        <div
          key={i}
          className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-5 my-6"
        >
          {section.title && (
            <p className="font-semibold text-white mb-2">{section.title}</p>
          )}
          <p className="text-gray-400">{section.content}</p>
        </div>
      );
    case "list":
      return (
        <ul key={i}>
          {section.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={i}>
          {section.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ol>
      );
    case "cta-inline":
      return (
        <div key={i} className="my-6 text-center">
          <Link
            href="/audit"
            className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-3 rounded-lg transition-all"
          >
            {section.content || "Get Your Free AI Audit"}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPostLayout({
  metadata,
  tableOfContents,
  faqs,
  sections,
  relatedPosts,
}) {
  return (
    <>
      <Navbar />
      <BlogHero metadata={metadata} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
          {/* Main content */}
          <article className="blog-prose min-w-0">
            {sections.map((section, i) => renderSection(section, i))}

            <BlogFAQ faqs={faqs} />
            <AuthorByline author={metadata.author} />
            <BlogCTA />
          </article>

          {/* Sidebar — TOC */}
          <aside className="hidden lg:block">
            <TableOfContents items={tableOfContents} />
          </aside>
        </div>

        <RelatedPosts posts={relatedPosts} />
      </div>

      <Footer />
    </>
  );
}
