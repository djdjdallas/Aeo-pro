import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Don't protect the login page itself
  if (pathname === "/admin/login") {
    // If already logged in, redirect to admin dashboard
    const adminToken = request.cookies.get("admin_token")?.value;
    if (adminToken && adminToken === process.env.ADMIN_KEY) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin/* pages
  const adminToken = request.cookies.get("admin_token")?.value;
  if (!adminToken || adminToken !== process.env.ADMIN_KEY) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
