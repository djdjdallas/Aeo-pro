import { cookies } from "next/headers";

/**
 * Check if a request is authenticated as admin.
 * Accepts either:
 *   1. ?key= query parameter (for cron jobs / external calls)
 *   2. admin_token cookie (for browser sessions)
 */
export function isAdminAuthed(request) {
  // Check query param first (for cron jobs)
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key && key === process.env.ADMIN_KEY) return true;

  // Check cookie (for browser sessions)
  const adminToken = request.cookies.get("admin_token")?.value;
  if (adminToken && adminToken === process.env.ADMIN_KEY) return true;

  return false;
}
