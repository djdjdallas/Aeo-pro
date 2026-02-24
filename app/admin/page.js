import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import AdminLeadsTable from "@/components/AdminLeadsTable";

export const metadata = {
  title: "Admin — AEO Pro Leads",
  robots: "noindex, nofollow",
};

export default async function AdminPage({ searchParams }) {
  const { key } = await searchParams;

  if (!key || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  const supabase = createServerClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch leads:", error);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              AEO<span className="text-[#3b82f6]">Pro</span> Leads
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {leads?.length || 0} total leads
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/tracker?key=${key}`}
              className="text-sm text-[#3b82f6] hover:text-blue-300 transition-colors"
            >
              AI Tracker &rarr;
            </Link>
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to site
            </a>
          </div>
        </div>
        <AdminLeadsTable leads={leads || []} adminKey={key} />
      </div>
    </div>
  );
}
