import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 hover:border-[#3b82f6]/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs capitalize">
          {post.category}
        </Badge>
        {post.industry && (
          <Badge variant="outline" className="text-xs capitalize">
            {post.industry}
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white group-hover:text-[#3b82f6] transition-colors leading-snug">
        {post.title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
        {post.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {post.readingTime}
        </span>
        <span className="flex items-center gap-1 text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity">
          Read <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
