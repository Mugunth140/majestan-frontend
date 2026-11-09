import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchApi } from "./api";
import { trackSiteEvent } from "./site-analytics";

vi.mock("./site-analytics", () => ({ trackSiteEvent: vi.fn() }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("API reliability telemetry", () => {
  it.each([400, 401, 403, 404, 422])(
    "does not count expected HTTP %i as an analytics error",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("{}", { status })),
      );
      await expect(fetchApi("/test")).rejects.toBeDefined();
      expect(trackSiteEvent).not.toHaveBeenCalled();
    },
  );
  it.each([429, 500, 502, 503])("counts HTTP %i once", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status })),
    );
    await expect(fetchApi("/test")).rejects.toBeDefined();
    expect(trackSiteEvent).toHaveBeenCalledExactlyOnceWith("api_error", {
      statusCode: status,
    });
  });
  it("counts network failure as status zero and preserves the original rejection", async () => {
    const error = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(fetchApi("/test")).rejects.toBe(error);
    expect(trackSiteEvent).toHaveBeenCalledExactlyOnceWith("api_error", {
      statusCode: 0,
    });
  });
  it("does not count intentional request cancellation as a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
    );
    await expect(fetchApi("/test")).rejects.toBeDefined();
    expect(trackSiteEvent).not.toHaveBeenCalled();
  });
});
