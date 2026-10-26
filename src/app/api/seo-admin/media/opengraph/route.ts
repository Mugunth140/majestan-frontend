import { NextRequest, NextResponse } from "next/server";
import { SEO_API_BASE } from "@/lib/seo-api-base";

export const dynamic = "force-dynamic";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) {
      return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") || "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    return NextResponse.json({ message: "Choose a JPEG, PNG or WebP image" }, { status: 400 });
  }
  if (Number(request.headers.get("content-length")) > MAX_BYTES) {
    return NextResponse.json({ message: "Image must be 5 MB or smaller" }, { status: 413 });
  }
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ message: "Choose an image to upload" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return NextResponse.json({ message: "Image must be 5 MB or smaller" }, { status: 413 });
      }
      chunks.push(value);
    }
    if (!size) return NextResponse.json({ message: "Choose an image to upload" }, { status: 400 });
    const buffer = Buffer.concat(chunks);
    const upstream = await fetch(`${SEO_API_BASE}/seo-admin/media/opengraph`, {
      method: "POST",
      headers: { "Content-Type": contentType, Cookie: request.headers.get("cookie") || "" },
      body: buffer,
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Image upload failed. Please retry." }, { status: 502 });
  }
}
