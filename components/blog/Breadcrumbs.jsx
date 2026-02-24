import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} className="shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-300 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
