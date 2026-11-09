import { NextRequest } from "next/server";

export const runtime = "nodejs";
const MAX_BYTES = 24 * 1024;
const respond = (status: number) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export function GET() {
  // Runtime flag: cached/static pages must not freeze a build-time setting.
  return Response.json(
    {
      enabled: process.env.SITE_ANALYTICS_ENABLED === "true",
      allowLocal:
        process.env.NODE_ENV !== "production" &&
        process.env.SITE_ANALYTICS_ALLOW_LOCAL === "true",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Bounded streaming read: Content-Length is optional and must not be trusted. */
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new RangeError("Too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: NextRequest) {
  if (process.env.SITE_ANALYTICS_ENABLED !== "true") return respond(204);
  if (
    request.headers.get("dnt") === "1" ||
    request.headers.get("sec-gpc") === "1"
  )
    return respond(204);
  let origin: URL;
  try {
    origin = new URL(request.headers.get("origin") ?? "");
  } catch {
    return respond(403);
  }
  const local =
    process.env.NODE_ENV !== "production" &&
    process.env.SITE_ANALYTICS_ALLOW_LOCAL === "true" &&
    ["localhost", "127.0.0.1"].includes(origin.hostname);
  if (
    !(
      origin.protocol === "https:" &&
      ["majestanrealty.com", "www.majestanrealty.com"].includes(
        origin.hostname,
      ) &&
      !origin.port
    ) &&
    !local
  )
    return respond(403);
  if (
    request.headers.get("sec-fetch-site") &&
    !["same-origin", "none"].includes(request.headers.get("sec-fetch-site")!)
  )
    return respond(403);
  const key = process.env.INTERNAL_API_KEY;
  if (!key) return respond(503);
  try {
    const raw = await readBody(request);
    const body = JSON.parse(raw);
    if (
      body?.version !== 1 ||
      !Array.isArray(body.events) ||
      body.events.length < 1 ||
      body.events.length > 20
    )
      return respond(400);
    const base = (
      process.env.API_BASE_URL ||
      `${process.env.SITE_BACKEND_URL || "http://localhost:5000"}/api/v1`
    ).replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-internal-key": key,
      origin: origin.origin,
      "user-agent": request.headers.get("user-agent") || "",
      // Caddy overwrites X-Real-IP. Never forward browser cookies or authorization.
      "x-client-ip": request.headers.get("x-real-ip") || "unknown",
    };
    // This dedicated header is cleared/set by Caddy, not taken from a browser's CF-* header.
    const country = request.headers.get("x-analytics-country");
    if (country && /^[A-Z]{2}$/.test(country))
      headers["x-analytics-country"] = country;
    const response = await fetch(`${base}/analytics/events`, {
      method: "POST",
      headers,
      body: raw,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return respond(
      response.ok
        ? 204
        : [400, 401, 403, 413, 429].includes(response.status)
          ? response.status
          : 503,
    );
  } catch (error) {
    return respond(
      error instanceof RangeError
        ? 413
        : error instanceof SyntaxError
          ? 400
          : 503,
    );
  }
}
