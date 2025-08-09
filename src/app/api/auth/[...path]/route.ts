import { NextRequest } from "next/server";

const CONVEX_SITE = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://calm-ibis-514.convex.site";

type RouteContext = { params: { path: string[] } };

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, context.params);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxy(req, context.params);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxy(req, context.params);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxy(req, context.params);
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  const url = new URL(req.url);
  const target = `${CONVEX_SITE}/api/auth/${path.join("/")}${url.search}`;

  // Forward the original headers/body; do NOT override Host so Convex
  // can detect the external app domain via SITE_URL and return cookies/redirects correctly
  const init: RequestInit = {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  };

  const res = await fetch(target, init);

  // Pass through all headers as-is so Set-Cookie is preserved
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}


