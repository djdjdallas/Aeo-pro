import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import AdminLeadsTable from "@/components/AdminLeadsTable";

export const metadata = {
  title: "Admin — AEO Pro Leads",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch leads:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">
            {leads?.length || 0} total leads
          </p>
        </div>
      </div>
      <AdminLeadsTable leads={leads || []} />
    </div>
  );
}
