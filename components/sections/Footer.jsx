export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <a href="#" className="text-lg font-bold text-white tracking-tight">
          AEO<span className="text-[#3b82f6]">Pro</span>
        </a>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} AEO Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
