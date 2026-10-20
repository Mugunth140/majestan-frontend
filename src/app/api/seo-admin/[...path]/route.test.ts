import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { PUT } from "./route";

vi.mock("@/lib/seo-api-base", () => ({
  SEO_API_BASE: "https://backend.example/api/v1",
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const routeContext = (path: string[]) => ({
  params: Promise.resolve({ path }),
});
const requestFor = (
  path: string[],
  options: {
    method?: string;
    origin?: string;
    body?: string;
    cookie?: string;
  } = {},
) =>
  new NextRequest(`http://localhost:3000/api/seo-admin/${path.join("/")}`, {
    method: options.method || "PUT",
    headers: {
      host: "localhost:3000",
      ...(options.origin === undefined
        ? { origin: "http://localhost:3000" }
        : { origin: options.origin }),
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    ...(options.body ? { body: options.body } : {}),
  });

describe("SEO admin proxy route", () => {
  let upstreamFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    upstreamFetch = vi.fn().mockResolvedValue(
      new Response('{"saved":true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", upstreamFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it.each([
    "page:/about-us",
    "page:/services/property-management",
    "page:services/nri-services",
  ])(
    "forwards the core config key %s as one encoded upstream parameter and revalidates after success",
    async (configKey) => {
      const request = requestFor(["configs", configKey], {
        body: '{"meta_title":"Updated title"}',
        cookie: "admin_session=session-value",
      });

      const response = await PUT(request, routeContext(["configs", configKey]));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ saved: true });
      expect(upstreamFetch).toHaveBeenCalledOnce();
      const [url, init] = upstreamFetch.mock.calls[0];
      expect(url).toBe(
        `https://backend.example/api/v1/seo-admin/configs/${encodeURIComponent(configKey)}`,
      );
      expect(new URL(url).pathname.split("/").at(-1)).toBe(
        encodeURIComponent(configKey),
      );
      expect(init).toMatchObject({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: "admin_session=session-value",
        },
        body: '{"meta_title":"Updated title"}',
        cache: "no-store",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    },
  );

  it.each([
    { path: ["configs", "page:/../bad"], name: "traversal core config key" },
    { path: ["other", "segment/with-slash"], name: "slash in non-config path" },
  ])("rejects $name with 400 before forwarding", async ({ path }) => {
    const response = await PUT(requestFor(path), routeContext(path));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid path" });
    expect(upstreamFetch).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin mutation before forwarding", async () => {
    const path = ["configs", "page:/about-us"];
    const response = await PUT(
      requestFor(path, { origin: "https://attacker.example" }),
      routeContext(path),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: "Invalid request origin",
    });
    expect(upstreamFetch).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
