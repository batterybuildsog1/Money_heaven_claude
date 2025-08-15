import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.split("=")[0]?.trim())
      .filter((n) => n);

    const env = {
      convexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      jwks: !!process.env.JWKS,
      jwtPrivateKey: !!process.env.JWT_PRIVATE_KEY,
    };

    return NextResponse.json({ ok: true, cookies, env });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}


