import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { POST } from "./route";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
const request = (secret: string) => new NextRequest("https://example.com/api/revalidate", { method: "POST", body: JSON.stringify({ slug: "project-pa0006", secret }) });
describe("CRM cache refresh", () => {
  it("expires inventory and SEO snapshots and the actual rewritten route after an authorized update", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    const response = await POST(request("test-secret"));
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("public-inventory", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("public-seo", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/detail-render/project-pa0006", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/project-pa0006/photos", "page");
    expect(revalidatePath).not.toHaveBeenCalledWith("/", "layout");
  });
  it("rejects unauthorized invalidation", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    expect((await POST(request("wrong-secret"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
