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
    const requestBody = !["GET", "HEAD"].includes(request.method)
      ? await request.text()
      : undefined;
    const upstream = await fetch(
      `${base}/seo-admin/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        ...(!["GET", "HEAD"].includes(request.method)
          ? { body: requestBody }
          : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(60000),
      },
    );
    const responseBody = await upstream.text();
    const response = new NextResponse(responseBody, {
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
    ) {
      const paths = new Set<string>();
      const collect = (raw: string | undefined) => {
        try {
          const visit = (value: any, depth = 0) => {
            if (!value || typeof value !== "object" || depth > 4) return;
            for (const [key, item] of Object.entries(value)) {
              if (
                [
                  "public_path",
                  "source_path",
                  "destination_path",
                  "redirect_target_path",
                  "expired_redirect_path",
                  "path",
                ].includes(key) &&
                typeof item === "string" &&
                item.startsWith("/") &&
                !item.startsWith("//") &&
                item.length <= 1024 &&
                !/[\\[\]#?]/.test(item)
              )
                paths.add(item);
              else if (item && typeof item === "object") visit(item, depth + 1);
            }
          };
          visit(JSON.parse(raw || "{}"));
        } catch {
          /* Empty/non-JSON success responses still use broad invalidation. */
        }
      };
      collect(requestBody);
      collect(responseBody);
      if (path[0] === "configs" && path[1]?.startsWith("page:"))
        paths.add(path[1].slice(5));
      for (const affected of paths) {
        revalidatePath(affected);
        const parent = affected.replace(
          /\/(floor-plans?|photos|amenities|locality)$/,
          "",
        );
        if (parent !== affected) revalidatePath(parent);
      }
      // Includes old slug paths, deleted redirects, templates and rewritten destinations.
      revalidatePath("/", "layout");
    }
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
