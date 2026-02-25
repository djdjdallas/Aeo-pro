import { Suspense } from "react";
import NewTrackerClientForm from "@/components/tracker/NewTrackerClientForm";

export const metadata = {
  title: "Add Tracker Client — Admin",
  robots: "noindex, nofollow",
};

export default function NewTrackerClientPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <NewTrackerClientForm />
    </Suspense>
  );
}
