// lib/client-auth.js
// Helpers for client portal authentication using Supabase Auth

import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client that uses the user's access token from cookies.
 * For server components and API routes in the client portal.
 */
export function createAuthClient(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

/**
 * Validate an access token and return the user + linked client.
 * Used by API routes and server components.
 */
export async function getClientSession(request) {
  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies?.get("sb-access-token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) return { user: null, client: null };

  const { createServerClient } = await import("@/lib/supabase");
  const supabase = createServerClient();

  // Verify the token with Supabase Auth
  const authClient = createAuthClient(token);
  const { data: { user }, error } = await authClient.auth.getUser();

  if (error || !user) return { user: null, client: null };

  // Look up the linked tracker client
  const { data: clientUser } = await supabase
    .from("client_users")
    .select("*, tracker_clients(*)")
    .eq("auth_user_id", user.id)
    .single();

  return {
    user,
    clientUser: clientUser || null,
    client: clientUser?.tracker_clients || null,
  };
}
