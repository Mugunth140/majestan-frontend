import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOwnerDraft } from "./use-owner-draft";
import { emptyDraft } from "./owner-post-model";
const api = vi.hoisted(() => ({ draft: vi.fn(), saveDraft: vi.fn() }));
vi.mock("./owner-post-api", () => ({ ownerApi: api }));
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  api.saveDraft.mockResolvedValue({ saved: true });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("account draft lifecycle", () => {
  it("waits for a delayed restore and does not overwrite it with an empty autosave", async () => {
    let resolve!: (value: unknown) => void;
    api.draft.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result } = renderHook(() => useOwnerDraft("token", 11));
    expect(result.current.ready).toBe(false);
    expect(api.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      resolve({
        payload: {
          ...emptyDraft(),
          category: "villa",
          values: { title: "My saved villa" },
        },
      });
    });
    expect(result.current.draft.values.title).toBe("My saved villa");
    expect(api.saveDraft).not.toHaveBeenCalled();
  });
  it("ignores a previous account response after switching accounts", async () => {
    let first!: (value: unknown) => void;
    api.draft.mockImplementation((token: string) =>
      token === "first"
        ? new Promise((r) => {
            first = r;
          })
        : Promise.resolve({
            payload: {
              ...emptyDraft(),
              category: "plot",
              values: { title: "Second account plot" },
            },
          }),
    );
    const { result, rerender } = renderHook(
      ({ token, id }) => useOwnerDraft(token, id),
      { initialProps: { token: "first", id: 11 } },
    );
    await waitFor(() => expect(api.draft).toHaveBeenCalledWith("first", expect.anything()));
    rerender({ token: "second", id: 12 });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      first({
        payload: { ...emptyDraft(), values: { title: "First account home" } },
      });
    });
    expect(result.current.draft.values.title).toBe("Second account plot");
    expect(JSON.parse(localStorage.getItem("majestan_owner_draft_user_12_v2")!).draft.values.title).toBe("Second account plot");
  });
  it("debounces edits and does not create an empty draft after completing", async () => {
    vi.useFakeTimers();
    api.draft.mockResolvedValue({ payload: null });
    const { result } = renderHook(() => useOwnerDraft("token", 11));
    await act(async () => {});
    act(() => {
      result.current.update((d) => ({ ...d, category: "plot" }));
      result.current.update((d) => ({ ...d, values: { title: "Plot" } }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(api.saveDraft).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.pause();
      result.current.complete();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(api.saveDraft).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("majestan_owner_draft_user_11_v2")).toBeNull();
  });
  it("keeps edits local and offers retry when a server draft could not be read", async () => {
    api.draft.mockRejectedValue(new Error("Offline"));
    const { result } = renderHook(() => useOwnerDraft("token", 11));
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() =>
      result.current.update((d) => ({
        ...d,
        category: "plot",
        values: { title: "Offline plot" },
      })),
    );
    expect(result.current.status).toContain("could not load");
    expect(api.saveDraft).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem("majestan_owner_draft_user_11_v2")!).draft
        .values.title,
    ).toBe("Offline plot");
  });
});
