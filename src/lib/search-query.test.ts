import { afterEach, describe, expect, it, vi } from "vitest";
import { searchProperties } from "./api";
import { listProjects } from "./api/projects";
import { searchText } from "./search-query";

afterEach(() => vi.unstubAllGlobals());

function mockApi() {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 12 })));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

function query(fetch: ReturnType<typeof mockApi>) {
  return new URL(String(fetch.mock.calls[0][0]), "https://example.com").searchParams;
}

describe("public search requests", () => {
  it("bounds property keywords and locations at the API boundary for SSR and browser callers", async () => {
    const fetch = mockApi();
    await searchProperties({ propertyName: " x".repeat(121), location: "a".repeat(101), city: "b".repeat(101), propertyAge: "c".repeat(17) });
    const params = query(fetch);
    expect(params.get("propertyName")).toHaveLength(120);
    expect(params.get("location")).toHaveLength(100);
    expect(params.get("city")).toHaveLength(100);
    expect(params.get("propertyAge")).toHaveLength(16);
  });

  it("keeps valid property filters and omits invalid enums rather than failing the page", async () => {
    const fetch = mockApi();
    await searchProperties({ propertyName: "  Garden Villa  ", listingType: "Rent", propertyCondition: "Resale", sort: "bad", page: -5, limit: 999 });
    const params = query(fetch);
    expect(params.get("propertyName")).toBe("Garden Villa");
    expect(params.get("listingType")).toBe("Rent");
    expect(params.has("propertyCondition")).toBe(false);
    expect(params.has("sort")).toBe(false);
    expect(params.get("page")).toBe("1");
    expect(params.get("limit")).toBe("100");
  });

  it("counts Unicode characters without splitting a surrogate pair", () => {
    expect(searchText("😀".repeat(121), 120)).toBe("😀".repeat(120));
    expect(searchText("  ", 120)).toBeUndefined();
  });

  it("does not send malformed project filters from public URLs", async () => {
    const fetch = mockApi();
    await listProjects({ projectType: "plot", possession: "Ready", bhk: NaN, minPrice: Infinity, maxPrice: -1, page: 1.5, limit: 500 });
    expect(Object.fromEntries(query(fetch))).toEqual({ page: "1", limit: "100" });
  });

  it("preserves supported project filters, zero price, and false RERA", async () => {
    const fetch = mockApi();
    await listProjects({ city: "Coimbatore", projectType: "villa", possession: "ready_to_move", bhk: 3, minPrice: 0, maxPrice: 9000000, rera: false, page: 2, limit: 12 });
    expect(Object.fromEntries(query(fetch))).toEqual({ city: "Coimbatore", projectType: "villa", possession: "ready_to_move", bhk: "3", minPrice: "0", maxPrice: "9000000", rera: "false", page: "2", limit: "12" });
  });

  it("retains the project validation reason for diagnosing future failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: ["Unexpected filter"] }), { status: 400 })));
    await expect(listProjects()).rejects.toMatchObject({ status: 400, message: "Projects API failed: 400 (Unexpected filter)" });
  });

  it("continues to surface real service failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));
    await expect(listProjects()).rejects.toMatchObject({ status: 503 });
    await expect(searchProperties({ propertyName: "Villa" })).rejects.toMatchObject({ status: 503 });
  });
});
