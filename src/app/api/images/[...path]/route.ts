import { NextRequest, NextResponse } from "next/server";
import { MEDIA_BASE } from "@/constants/assets";

// Supabase Storage ignores per-object Cache-Control and always serves
// non-cacheable responses (github.com/supabase/storage/issues/18). This
// route fetches the object server-side and sets Cache-Control ourselves.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const upstreamUrl = `${MEDIA_BASE}${path.map(encodeURIComponent).join("/")}`;

  const upstream = await fetch(upstreamUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("Content-Type") ?? "application/octet-stream"
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(upstream.body, { status: 200, headers });
}
