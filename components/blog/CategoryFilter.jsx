"use client";

import { useState } from "react";
import BlogCard from "./BlogCard";
import { categories } from "@/content";

export default function CategoryFilter({ posts }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              active === cat.slug
                ? "bg-[#3b82f6] text-white"
                : "bg-[#1f1f1f] text-gray-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
