import { render, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { SiteAnalytics } from "./site-analytics";

vi.mock("next/web-vitals", () => ({ useReportWebVitals: vi.fn() }));

describe("analytics effect isolation", () => {
  const any = Object.getOwnPropertyDescriptor(AbortSignal, "any");
  const timeout = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "location",
      new URL("https://www.majestanrealty.com/projects"),
    );
    vi.stubGlobal("crypto", { randomUUID });
    sessionStorage.clear();
    localStorage.clear();
    Object.defineProperty(navigator, "doNotTrack", {
      configurable: true,
      value: "0",
    });
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      value: false,
    });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    if (any) Object.defineProperty(AbortSignal, "any", any);
    if (timeout) Object.defineProperty(AbortSignal, "timeout", timeout);
  });

  it("mounts without newer AbortSignal APIs and aborts the fallback after four seconds", async () => {
    Reflect.deleteProperty(AbortSignal, "any");
    Reflect.deleteProperty(AbortSignal, "timeout");
    const fetcher = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetcher);
    let view: ReturnType<typeof render>;
    expect(() => {
      view = render(
        <>
          <SiteAnalytics />
          <main>The website</main>
        </>,
      );
    }).not.toThrow();
    expect(view!.container.innerHTML).toBe("<main>The website</main>");
    const signal = fetcher.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(signal.aborted).toBe(true);
  });

  it("contains synchronous fetch failures inside the effect", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("unavailable transport");
      }),
    );
    expect(() => render(<SiteAnalytics />)).not.toThrow();
  });
});
