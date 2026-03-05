"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuditModal } from "@/components/AuditModalContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useAuditModal();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hashLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  function resolveHref(href) {
    if (href.startsWith("#") && !isHome) return `/${href}`;
    return href;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1f1f1f]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          First<span className="text-[#3b82f6]">Answer</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {hashLinks.map((link) => (
            <a
              key={link.href}
              href={resolveHref(link.href)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Blog
          </Link>
          <button
            onClick={() => openModal()}
            className="cta-glow bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-5 py-2 rounded-lg transition-all"
          >
            Get Your Free Audit
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1f1f1f] px-4 pb-4">
          {hashLinks.map((link) => (
            <a
              key={link.href}
              href={resolveHref(link.href)}
              className="block py-3 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            className="block py-3 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Blog
          </Link>
          <button
            className="cta-glow inline-block mt-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-5 py-2 rounded-lg transition-all"
            onClick={() => {
              setMobileOpen(false);
              openModal();
            }}
          >
            Get Your Free Audit
          </button>
        </div>
      )}
    </nav>
  );
}
