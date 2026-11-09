import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "./route";

describe("same origin analytics relay", () => {
  const fetcher = vi.fn();
  const request = (
    body = JSON.stringify({ version: 1, events: [{ kind: "pageview" }] }),
    headers: Record<string, string> = {},
  ) =>
    new NextRequest("https://www.majestanrealty.com/api/analytics", {
      method: "POST",
      body,
      headers: {
        origin: "https://www.majestanrealty.com",
        "user-agent": "Browser",
        "x-real-ip": "192.0.2.4",
        ...headers,
      },
    });
  beforeEach(() => {
    vi.stubEnv("SITE_ANALYTICS_ENABLED", "true");
    vi.stubEnv("INTERNAL_API_KEY", "test-internal");
    vi.stubEnv("API_BASE_URL", "http://backend:5000/api/v1");
    fetcher.mockReset();
    fetcher.mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetcher);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it("accepts text beacons, injecting only server credentials and trusted metadata", async () => {
    expect(
      (
        await POST(
          request(undefined, {
            cookie: "private=1",
            authorization: "Bearer private",
            "cf-ipcountry": "US",
            "x-analytics-country": "IN",
          }),
        )
      ).status,
    ).toBe(204);
    expect(fetcher.mock.calls[0][0]).toBe(
      "http://backend:5000/api/v1/analytics/events",
    );
    const headers = fetcher.mock.calls[0][1].headers;
    expect(headers).toMatchObject({
      "x-internal-key": "test-internal",
      "x-client-ip": "192.0.2.4",
      "x-analytics-country": "IN",
    });
    expect(headers.cookie).toBeUndefined();
    expect(headers.authorization).toBeUndefined();
  });
  it("rejects foreign origins and cross-site requests before forwarding", async () => {
    expect(
      (await POST(request(undefined, { origin: "https://evil.com" }))).status,
    ).toBe(403);
    expect(
      (await POST(request(undefined, { "sec-fetch-site": "cross-site" })))
        .status,
    ).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("bounds chunked bodies, rejects invalid JSON and preserves failures for retry", async () => {
    expect((await POST(request("x".repeat(25 * 1024)))).status).toBe(413);
    expect((await POST(request("{"))).status).toBe(400);
    fetcher.mockResolvedValueOnce({ ok: false, status: 503 });
    expect((await POST(request())).status).toBe(503);
  });
  it("is quiet when disabled or opted out", async () => {
    expect((await POST(request(undefined, { "sec-gpc": "1" }))).status).toBe(
      204,
    );
    vi.stubEnv("SITE_ANALYTICS_ENABLED", "false");
    expect((await POST(request())).status).toBe(204);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reads the enable flag at runtime so static pages need no analytics rebuild", async () => {
    expect((await GET().json()).enabled).toBe(true);
    vi.stubEnv("SITE_ANALYTICS_ENABLED", "false");
    expect((await GET().json()).enabled).toBe(false);
    expect(GET().headers.get("Cache-Control")).toBe("no-store");
  });
});
