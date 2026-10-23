import { afterEach, describe, expect, it, vi } from "vitest";
import { connection } from "next/server";
import { getSeoForDetail } from "@/lib/seo-engine";
import SlugPage from "../../[slug]/page";
import DetailPage from "./page";
vi.mock("next/server", () => ({ connection: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/seo-engine", () => ({ getSeoForDetail: vi.fn() }));
vi.mock("../../[slug]/page", () => ({ default: vi.fn().mockResolvedValue(null), generateMetadata: vi.fn() }));
afterEach(() => vi.clearAllMocks());
describe("detail cache boundary", () => {
  it("keeps inventory independent of request query parameters", async () => {
    vi.mocked(getSeoForDetail).mockResolvedValue({ scope: "project" });
    await DetailPage({ params: Promise.resolve({ segments: ["project-pa01"] }) });
    expect(connection).not.toHaveBeenCalled();
    expect(SlugPage).toHaveBeenCalledOnce();
  });
  it("preserves dynamic filters when a custom listing rule looks like an inventory URL", async () => {
    vi.mocked(getSeoForDetail).mockResolvedValue({ scope: "listing" });
    const searchParams = Promise.resolve({ page: "2", minPrice: "5000000" });
    await DetailPage({ params: Promise.resolve({ segments: ["custom-pa01"] }), searchParams });
    expect(connection).toHaveBeenCalledOnce();
    expect(vi.mocked(SlugPage).mock.calls[0][0].searchParams).toBe(searchParams);
  });
  it("does not generate fallback HTML after an SEO service failure", async () => {
    vi.mocked(getSeoForDetail).mockRejectedValue(new Error("API unavailable"));
    await expect(DetailPage({ params: Promise.resolve({ segments: ["project-pa01"] }) })).rejects.toThrow("API unavailable");
    expect(SlugPage).not.toHaveBeenCalled();
  });
});
