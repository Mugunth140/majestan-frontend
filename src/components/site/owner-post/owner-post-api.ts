import { API_BASE_URL, fetchApi } from "@/lib/api";
import type { FormData, OwnerDraft } from "./owner-post-model";

export const ownerApi = {
  formData: (signal?: AbortSignal) =>
    fetchApi<FormData>("/properties/form-data", { cache: "no-store", signal }),
  draft: (token: string, signal?: AbortSignal): Promise<{ payload: unknown }> =>
    ownerApi.request("/drafts/me", token, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(8000)])
        : AbortSignal.timeout(8000),
    }),
  saveDraft: (token: string, draft: OwnerDraft): Promise<unknown> =>
    ownerApi.request("/drafts", token, {
      method: "POST",
      body: JSON.stringify({ payload: draft }),
      signal: AbortSignal.timeout(10000),
    }),
  // Owner requests retain validation messages and auth errors in the wizard.
  // In particular, an expired token opens the existing OTP modal without losing input.
  async request<T>(
    path: string,
    token: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/owner${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      signal: init.signal ?? AbortSignal.timeout(120000),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message;
      throw Object.assign(
        new Error(
          Array.isArray(message)
            ? message.join(" ")
            : message || "We could not save your property. Please try again.",
        ),
        { status: response.status },
      );
    }
    return payload?.data ?? payload;
  },
};
