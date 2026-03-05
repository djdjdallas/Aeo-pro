"use client";

import { useAuditModal } from "@/components/AuditModalContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

function PillTag({ children, className = "" }) {
  return (
    <span className={`inline-block border border-current rounded-full px-3.5 py-1 text-[0.65rem] uppercase tracking-wider font-medium ${className}`}>
      {children}
    </span>
  );
}

function CircleBtn({ dark = false, href }) {
  const inner = (
    <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${dark ? "bg-black/10" : "bg-white/10"}`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </span>
  );
  if (href) return <a href={href}>{inner}</a>;
  return inner;
}

export default function DashboardHero() {
  const { openModal } = useAuditModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Blog", href: "/blog" },
  ];

  function resolveHref(href) {
    if (href.startsWith("#") && !isHome) return `/${href}`;
    return href;
  }

  // Bar chart animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const barHeights = [40, 85, 50, 30, 60, 45];
  const barLabels = ["Google", "GPT-4", "Bing", "Perplexity", "Claude", "Voice"];

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-black p-3 sm:p-5 lg:p-6">
      {/* App frame */}
      <div className="w-full max-w-[1600px] bg-[#050505] border-2 border-[#333] rounded-[32px] p-4 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-5 lg:gap-6 min-h-[calc(100vh-2.5rem)] sm:min-h-0 sm:h-[calc(100vh-2.5rem)]">

        {/* Nav bar */}
        <nav className="bg-[#1c1c1c] rounded-full px-2 flex justify-between items-center h-[62px] shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Link
              href="/"
              className="bg-[#ff3b30] text-white font-semibold text-xs px-5 py-2.5 rounded-full uppercase tracking-wider whitespace-nowrap"
            >
              First Answer
            </Link>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href.startsWith("/") ? link.href : resolveHref(link.href)}
                className="hidden sm:block text-[#a0a0a0] hover:text-white text-sm px-4 py-2.5 rounded-full border border-[#333] hover:border-[#555] transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal()}
              className="text-white text-sm px-5 py-2.5 rounded-full bg-[#333] hover:bg-[#444] transition-colors whitespace-nowrap mr-1"
            >
              Get Audit
            </button>
            <button
              className="sm:hidden text-[#a0a0a0] hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden bg-[#1c1c1c] rounded-2xl px-4 py-3 -mt-2 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href.startsWith("/") ? link.href : resolveHref(link.href)}
                className="text-[#a0a0a0] hover:text-white text-sm py-2.5 px-3 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr] grid-rows-[1.5fr_1fr] gap-4 sm:gap-5 lg:gap-6 flex-1 min-h-0">

          {/* Hero card — spans full top row */}
          <div className="md:col-span-2 xl:col-span-3 rounded-[20px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-end bg-gradient-to-br from-[#777] via-[#999] to-[#8c8c8c]">
            {/* Geometric shards */}
            <div
              className="absolute hidden lg:block w-[300px] h-[400px] -top-[100px] right-[20%] rotate-[25deg] z-[1]"
              style={{
                clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                background: "linear-gradient(180deg, #111 0%, #333 100%)",
              }}
            />
            <div
              className="absolute hidden lg:block w-[200px] h-[200px] top-[50px] right-[10%] -rotate-[15deg] bg-black z-[1]"
              style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
            />

            <PillTag className="text-white/70 border-white/30 mb-auto">
              Answer Engine Optimization
            </PillTag>

            <div className="relative z-[2] max-w-[60%] mt-8 sm:mt-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.2rem] font-medium text-white leading-[1.1] tracking-tight mb-6">
                Your customers are asking AI who to call.{" "}
                <span className="underline decoration-3 underline-offset-[6px]">Are you the answer?</span>
              </h1>
              <div className="w-full h-px bg-white/40 mb-5" />
              <p className="text-sm sm:text-[0.95rem] text-white/80 max-w-[500px] leading-relaxed">
                When someone asks ChatGPT &ldquo;best plumber in Phoenix&rdquo; or &ldquo;top HVAC company near me&rdquo; &mdash; an AI gives them three names. We get you on that list.{" "}
                <button onClick={() => openModal()} className="underline text-white hover:text-white/90 transition-colors">
                  Get your free audit &rarr;
                </button>
              </p>
            </div>

            <button
              onClick={() => openModal()}
              className="absolute top-6 sm:top-8 right-6 sm:right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          {/* Yellow card — Zero-Click stat */}
          <div className="rounded-[20px] p-6 bg-[#e8c643] text-[#111] flex flex-col relative overflow-hidden">
            <PillTag className="text-[#111]/60 border-[#111]/20">Zero-Click Ratio</PillTag>
            <CircleBtn dark href="#how-it-works" />
            <div className="absolute top-6 right-6"><CircleBtn dark /></div>

            <div className="mt-auto">
              <p className="text-[4rem] sm:text-[5rem] font-semibold leading-none tracking-tighter">64.5%</p>
              <p className="text-right text-sm mb-3">of searches</p>
              <div className="border-t border-black/10 pt-3 flex items-start gap-2 text-[0.82rem] font-medium leading-snug">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Customers interact directly with AI answers without visiting a source website.</span>
              </div>
            </div>
          </div>

          {/* Green card — Entity Visibility chart */}
          <div className="rounded-[20px] p-6 bg-[#5cc963] text-[#111] flex flex-col relative">
            <PillTag className="text-[#111]/60 border-[#111]/20">Entity Visibility</PillTag>
            <div className="absolute top-6 right-6"><CircleBtn dark /></div>

            <div className="flex items-end justify-between h-[120px] mt-auto mb-2 gap-[2%]">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className={`w-[12%] rounded transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative ${i === 1 ? "bg-black" : "bg-black/10"}`}
                  style={{ height: mounted ? `${h}%` : "4%" }}
                >
                  {i === 1 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-lg">9.2</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[0.65rem] font-semibold opacity-70">
              {barLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          {/* Blue card — AEO Statistics */}
          <div className="md:col-span-2 xl:col-span-1 rounded-[20px] p-6 bg-[#d6dbec] text-[#111] flex flex-col relative">
            <PillTag className="text-[#111]/60 border-[#111]/20">AEO Statistics</PillTag>
            <div className="absolute top-6 right-6"><CircleBtn dark /></div>

            <div className="flex items-center gap-3 mt-auto mb-3">
              <div className="w-10 h-10 rounded-full bg-[#333] grid place-items-center text-white text-[0.55rem] font-bold shrink-0">
                AEO
              </div>
              <span className="font-semibold text-sm opacity-80">Client: Local Dental Group</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="text-sm">AI Mention Rate</span>
              <span className="text-lg font-bold">48,200+</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="text-sm">Share of Voice</span>
              <span className="text-lg font-bold">42%</span>
            </div>
            <div className="flex justify-between items-center py-3 relative">
              <span className="text-sm">Sentiment Score</span>
              <span className="text-lg font-bold">98%</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-full">
                <div className="h-full bg-black rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="flex justify-between items-center text-white text-[0.6rem] font-semibold tracking-wider px-3 shrink-0">
          <span>FIRST ANSWER / AEO AGENCY</span>
          <div className="hidden sm:flex gap-6">
            <span>AI VISIBILITY PLATFORM</span>
            <span>&copy; {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
            <span>AUDITS IN 24HRS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
