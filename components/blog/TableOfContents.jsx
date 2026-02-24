"use client";

import { useState, useEffect } from "react";

export default function TableOfContents({ items }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    headings.forEach((el) => observer.observe(el));
    return () => headings.forEach((el) => observer.unobserve(el));
  }, [items]);

  return (
    <nav className="hidden lg:block sticky top-28">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        On this page
      </p>
      <ul className="space-y-2 border-l border-[#1f1f1f]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block pl-4 text-sm leading-snug transition-colors ${
                activeId === item.id
                  ? "text-[#3b82f6] border-l-2 border-[#3b82f6] -ml-px"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
