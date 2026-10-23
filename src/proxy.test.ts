import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

afterEach(() => vi.unstubAllGlobals());
describe("inventory rendering routes", () => {
  it.each(["/PREMIER-ARIA-SQUARE-PA0019", "/Premier-Aria-Square-PA0019/photos"])("redirects uppercase inventory links before SEO lookup: %s", async path => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const response = await proxy(new NextRequest(`https://example.com${path}?utm_source=test`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://example.com${path.toLowerCase()}?utm_source=test`);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rewrites code-based detail URLs without a routing-table request", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const response = await proxy(new NextRequest("https://example.com/emerald-heights-pa0006?utm_source=test"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://example.com/detail-render/emerald-heights-pa0006?utm_source=test");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("keeps internal render URLs out of the public index", async () => {
    const response = await proxy(new NextRequest("https://example.com/detail-render/emerald-heights-pa0006"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://example.com/emerald-heights-pa0006");
  });
  it.each([
    ["/custom-project-name", "/detail-render/custom-project-name"],
    ["/custom-project-name/photos", "/detail-section/custom-project-name/photos"],
    ["/emerald-pa0006/floor-plans", "/detail-section/emerald-pa0006/floor-plans"],
    ["/apartments-for-sale-in-coimbatore", null],
  ])("preserves custom inventory and listing routing for %s", async (path, destination) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ inventory_paths: ["/custom-project-name"], redirects: [], paths: [] }))));
    const response = await proxy(new NextRequest(`https://example.com${path}`));
    expect(response.headers.get("x-middleware-rewrite")).toBe(destination ? `https://example.com${destination}` : null);
  });
  it("preserves configured custom redirects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ redirects: [{ source: "/old-custom", destination: "/new-custom" }] }))));
    const response = await proxy(new NextRequest("https://example.com/old-custom"));
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://example.com/new-custom");
  });
});
