import { Suspense } from "react";
import { redirect } from "next/navigation";
import NewTrackerClientForm from "@/components/tracker/NewTrackerClientForm";

export const metadata = {
  title: "Add Tracker Client — Admin",
  robots: "noindex, nofollow",
};

export default async function NewTrackerClientPage({ searchParams }) {
  const { key } = await searchParams;

  if (!key || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <NewTrackerClientForm adminKey={key} />
    </Suspense>
  );
}
