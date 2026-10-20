import { SEO_API_BASE } from "@/lib/seo-api-base";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
const base = SEO_API_BASE;
async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (
      !origin ||
      (() => {
        try {
          return new URL(origin).host !== request.headers.get("host");
        } catch {
          return true;
        }
      })()
    )
      return NextResponse.json(
        { message: "Invalid request origin" },
        { status: 403 },
      );
  }
  const { path } = await context.params;
  if (
    path.some((s, index) => {
      // Core config keys contain their fixed route, e.g. page:/about-us.
      // They remain a single encoded upstream parameter, never a route.
      const coreConfigKey =
        path.length === 2 &&
        path[0] === "configs" &&
        index === 1 &&
        /^page:\/?(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/.test(s);
      return (
        s === "." ||
        s === ".." ||
        s.includes("\\") ||
        (s.includes("/") && !coreConfigKey)
      );
    })
  )
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  try {
    const upstream = await fetch(
      `${base}/seo-admin/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        ...(!["GET", "HEAD"].includes(request.method)
          ? { body: await request.text() }
          : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(60000),
      },
    );
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
    for (const cookie of upstream.headers.getSetCookie())
      response.headers.append("Set-Cookie", cookie);
    if (
      upstream.ok &&
      !["GET", "HEAD"].includes(request.method) &&
      path[0] !== "auth"
    )
      revalidatePath("/", "layout");
    return response;
  } catch {
    return NextResponse.json(
      { message: "The SEO service is unavailable. Please retry." },
      { status: 502 },
    );
  }
}
export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
