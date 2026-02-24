import BlogCard from "./BlogCard";

export default function RelatedPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="my-16">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-6">
        Related Articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
