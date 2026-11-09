import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  SiteAnalyticsClient,
  analyticsAllowed,
  publicAnalyticsPath,
} from "./site-analytics";

describe("first party browser analytics", () => {
  let client: SiteAnalyticsClient;
  const fetcher = vi.fn();
  const calls = () =>
    fetcher.mock.calls
      .map(([, options]) => JSON.parse(options.body).events)
      .flat();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T10:00:00Z"));
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal(
      "location",
      new URL(
        "https://www.majestanrealty.com/projects?utm_source=google&email=private@example.com",
      ),
    );
    vi.stubGlobal("crypto", { randomUUID });
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 Chrome/123 Safari/537",
      configurable: true,
    });
    Object.defineProperty(navigator, "doNotTrack", {
      value: "0",
      configurable: true,
    });
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: false,
      configurable: true,
    });
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    fetcher.mockReset();
    fetcher.mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetcher);
    client = new SiteAnalyticsClient();
    client.start();
  });
  afterEach(() => {
    client.stop();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("disables collection without fetch, UUIDs or accessible session storage", () => {
    vi.stubGlobal("fetch", undefined);
    expect(analyticsAllowed()).toBe(false);
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("crypto", undefined);
    expect(analyticsAllowed()).toBe(false);
    vi.stubGlobal("crypto", {});
    expect(analyticsAllowed()).toBe(false);
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubGlobal("sessionStorage", undefined);
    expect(analyticsAllowed()).toBe(false);
    vi.stubGlobal("sessionStorage", {
      getItem() {
        throw new Error("SecurityError");
      },
    });
    expect(analyticsAllowed()).toBe(false);
  });

  it("flushes safely without AbortSignal.timeout or any", async () => {
    const any = Object.getOwnPropertyDescriptor(AbortSignal, "any");
    const timeout = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
    Reflect.deleteProperty(AbortSignal, "any");
    Reflect.deleteProperty(AbortSignal, "timeout");
    try {
      client.navigate();
      await client.flush();
      expect(calls().some((e) => e.kind === "pageview")).toBe(true);
      expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    } finally {
      if (any) Object.defineProperty(AbortSignal, "any", any);
      if (timeout) Object.defineProperty(AbortSignal, "timeout", timeout);
    }
  });

  it("stops duplicate idle heartbeats after the first unchanged interval, but still emits leave", async () => {
    client.navigate();
    await client.flush();
    // Let the first interval observe an already-idle page's entire active window.
    vi.setSystemTime(Date.now() + 60_000);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(calls().filter((e) => e.kind === "engagement")).toHaveLength(1);
    const sent = fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(3600_000);
    expect(fetcher).toHaveBeenCalledTimes(sent);
    client.stop();
    client.start();
    await client.flush();
    expect(calls().filter((e) => e.name === "leave")).toHaveLength(1);
  });

  it("does not flush interval traffic from a hidden tab", async () => {
    client.navigate();
    await client.flush();
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    const sent = fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetcher).toHaveBeenCalledTimes(sent);
  });

  it("coalesces scroll layout measurements into one frame and cancels on stop", async () => {
    client.navigate();
    await client.flush();
    let frame: FrameRequestCallback | undefined;
    const request = vi.fn((fn: FrameRequestCallback) => {
      frame = fn;
      return 42;
    });
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", request);
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const height = vi
      .spyOn(document.documentElement, "scrollHeight", "get")
      .mockReturnValue(2000);
    for (let i = 0; i < 20; i++) document.dispatchEvent(new Event("scroll"));
    expect(request).toHaveBeenCalledTimes(1);
    expect(height).not.toHaveBeenCalled();
    frame!(0);
    expect(height).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event("scroll"));
    client.stop();
    expect(cancel).toHaveBeenCalledWith(42);
  });

  it("counts one pageview per path and only allowed campaign labels, including SPA navigation", async () => {
    client.navigate();
    await client.flush();
    client.navigate();
    await client.flush();
    expect(calls().filter((e) => e.kind === "pageview")).toHaveLength(1);
    expect(calls()[0]).toMatchObject({
      path: "/projects",
      utmSource: "google",
    });
    expect(JSON.stringify(calls())).not.toContain("private@example.com");
    vi.stubGlobal(
      "location",
      new URL("https://www.majestanrealty.com/apartment-ap001"),
    );
    client.navigate();
    await Promise.resolve();
    await client.flush();
    expect(calls().filter((e) => e.kind === "pageview")).toHaveLength(2);
  });
  it("does not collect admin/private routes, DNT, GPC or opted-out visits", async () => {
    expect(publicAnalyticsPath("/admin/properties")).toBeNull();
    expect(publicAnalyticsPath("/email%2540example.com")).toBeNull();
    localStorage.setItem("majestan_analytics_opt_out", "1");
    client.navigate();
    await client.flush();
    expect(fetcher).not.toHaveBeenCalled();
    localStorage.clear();
    Object.defineProperty(navigator, "doNotTrack", {
      value: "1",
      configurable: true,
    });
    expect(analyticsAllowed()).toBe(false);
    Object.defineProperty(navigator, "doNotTrack", {
      value: "0",
      configurable: true,
    });
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: true,
      configurable: true,
    });
    expect(analyticsAllowed()).toBe(false);
  });
  it("retries an identical event ID after failure rather than generating another view", async () => {
    fetcher.mockResolvedValueOnce({ ok: false, status: 503 });
    client.navigate();
    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(15_000);
    await client.flush();
    const pages = calls().filter((e) => e.kind === "pageview");
    expect(pages.length).toBeGreaterThanOrEqual(2);
    expect(pages[0].id).toBe(pages[1].id);
  });
  it("attributes document vitals to the original page after soft navigation", async () => {
    client.navigate();
    await Promise.resolve();
    await client.flush();
    const first = calls()[0];
    vi.stubGlobal(
      "location",
      new URL("https://www.majestanrealty.com/about-us"),
    );
    client.navigate();
    await Promise.resolve();
    await client.flush();
    client.vital({ name: "LCP", id: "v5-metric", value: 1300, rating: "good" });
    await client.flush();
    expect(calls().find((e) => e.name === "LCP")).toMatchObject({
      path: "/projects",
      pageId: first.pageId,
      value: 1300,
    });
  });
  it("records cumulative active engagement and rotates an idle session", async () => {
    client.navigate();
    await Promise.resolve();
    await client.flush();
    const first = calls()[0];
    await vi.advanceTimersByTimeAsync(45_000);
    const heartbeats = calls().filter((e) => e.kind === "engagement");
    expect(heartbeats.length).toBeGreaterThan(0);
    expect(Math.max(...heartbeats.map((e) => e.durationMs))).toBe(30_000);
    await vi.advanceTimersByTimeAsync(30 * 60_000);
    client.track("search");
    await client.flush();
    const views = calls().filter((e) => e.kind === "pageview");
    expect(views.at(-1).sessionId).not.toBe(first.sessionId);
  });
  it("records contact clicks without storing phone/email destinations", async () => {
    client.navigate();
    await Promise.resolve();
    await client.flush();
    const anchor = document.createElement("a");
    anchor.href = "tel:+919876543210";
    document.body.append(anchor);
    anchor.click();
    await client.flush();
    anchor.remove();
    expect(calls().some((e) => e.name === "phone_click")).toBe(true);
    expect(JSON.stringify(calls())).not.toContain("9876543210");
  });
});
