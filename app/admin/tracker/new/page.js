import { Suspense } from "react";
import NewTrackerClientForm from "@/components/tracker/NewTrackerClientForm";

export const metadata = {
  title: "Add Tracker Client — Admin",
  robots: "noindex, nofollow",
};

export default function NewTrackerClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <NewTrackerClientForm />
    </Suspense>
  );
}
