import { NextRequest } from "next/server";

const CONVEX_SITE = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://calm-ibis-514.convex.site";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  const url = new URL(req.url);
  const target = `${CONVEX_SITE}/api/auth/${path.join("/")}${url.search}`;

  const headers = new Headers(req.headers);
  // Ensure host/cookie forwarding does not break cookies
  headers.set("host", new URL(CONVEX_SITE).host);

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  };

  const res = await fetch(target, init);

  const responseHeaders = new Headers(res.headers);
  // Forward Set-Cookie to the browser
  const setCookie = (res as any).headers.getSetCookie?.() ?? [];
  for (const c of setCookie) responseHeaders.append("Set-Cookie", c);

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}


