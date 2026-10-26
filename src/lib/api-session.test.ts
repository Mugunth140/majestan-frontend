import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchApi } from "./api";
import { useUserAuthStore } from "@/store/userAuthStore";

afterEach(() => { vi.unstubAllGlobals(); useUserAuthStore.getState().logout(); });

describe("visitor API errors", () => {
  it("clears the actual persisted session on 401 without navigating away", async () => {
    useUserAuthStore.getState().login("expired", { id: 1, name: "Visitor", phone: "9876543210", email: "", role: "user" });
    const before = window.location.href;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));
    await expect(fetchApi("/leads/property-enquiry", { method: "POST" })).rejects.toMatchObject({ status: 401 });
    expect(useUserAuthStore.getState()).toMatchObject({ token: null, user: null, isAuthenticated: false });
    expect(JSON.parse(localStorage.getItem("majestan_user_auth")!).state.token).toBeNull();
    expect(window.location.href).toBe(before);
  });

  it("preserves validation messages and status for inline form errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: ["Invalid visit date"] }), { status: 400 })));
    await expect(fetchApi("/leads/project-enquiry", { method: "POST" })).rejects.toMatchObject({ status: 400, message: "Invalid visit date" });
  });
});
