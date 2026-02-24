import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CategoryFilter from "@/components/blog/CategoryFilter";
import { getAllPosts } from "@/content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Blog — Answer Engine Optimization Insights",
  description:
    "Expert guides on Answer Engine Optimization (AEO). Learn how to get your business recommended by ChatGPT, Perplexity, and AI search engines.",
  path: "/blog",
  keywords: ["AEO blog", "answer engine optimization", "AI search", "local SEO"],
});

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            First Answer Blog
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl">
            Expert guides on getting your business recommended by AI search engines like ChatGPT, Perplexity, and Google AI Overviews.
          </p>

          <div className="mt-10">
            <CategoryFilter posts={posts} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
