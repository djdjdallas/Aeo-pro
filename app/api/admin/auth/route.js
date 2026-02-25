import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { key } = await request.json();

    if (!key || key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_token", key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
