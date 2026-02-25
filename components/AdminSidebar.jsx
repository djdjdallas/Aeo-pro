"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render on login page
  if (pathname === "/admin/login") return null;

  const links = [
    { href: "/admin", label: "Leads", match: (p) => p === "/admin" },
    { href: "/admin/tracker", label: "AI Tracker", match: (p) => p.startsWith("/admin/tracker") },
  ];

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-52 border-r border-[#1f1f1f] p-5 flex flex-col shrink-0">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-white">
          AEO<span className="text-[#3b82f6]">Pro</span>
        </h1>
        <p className="text-[11px] text-gray-600 mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const active = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                active
                  ? "bg-[#3b82f6]/10 text-[#3b82f6] font-medium"
                  : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1f1f1f] pt-4 space-y-2">
        <Link
          href="/"
          className="block text-xs text-gray-500 hover:text-white transition-colors"
        >
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
