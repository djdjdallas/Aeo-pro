import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold text-white tracking-tight">
              First<span className="text-[#3b82f6]">Answer</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Done-for-you AEO for local businesses. We get you recommended by ChatGPT, Perplexity, and every AI assistant your customers use.
            </p>
          </div>

          {/* NAP — Name, Address, Phone: critical trust signal for AI models */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-3">Contact</p>
            <address className="not-italic flex flex-col gap-1">
              <span className="text-sm text-gray-500">First Answer</span>
              <span className="text-sm text-gray-500">Las Vegas, NV, United States</span>
              <a href="mailto:hello@firstanswer.co" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                hello@firstanswer.co
              </a>
            </address>
            <p className="mt-3 text-xs text-gray-600">Serving local businesses across the United States</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-3">Product</p>
            <div className="flex flex-col gap-2">
              <a href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                How It Works
              </a>
              <a href="/#pricing" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Pricing
              </a>
              <a href="/#faq" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                FAQ
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-3">Resources</p>
            <div className="flex flex-col gap-2">
              <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Blog
              </Link>
              <Link href="/blog/what-is-answer-engine-optimization" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                What is AEO?
              </Link>
              <Link href="/audit" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Free AI Audit
              </Link>
            </div>
          </div>

          {/* Industries */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-3">Industries</p>
            <div className="flex flex-col gap-2">
              <Link href="/blog/aeo-for-hvac-companies" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                HVAC
              </Link>
              <Link href="/blog/aeo-for-personal-injury-lawyers" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Law Firms
              </Link>
              <Link href="/blog/aeo-for-med-spas" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Med Spas
              </Link>
              <Link href="/blog/aeo-for-roofers" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Roofing
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-[#1f1f1f] text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} First Answer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
