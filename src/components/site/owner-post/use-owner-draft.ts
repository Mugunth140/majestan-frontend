"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ownerApi } from "./owner-post-api";
import {
  cleanDraft,
  emptyDraft,
  hasProgress,
  persistableDraft,
  restoreDraft,
  type OwnerDraft,
} from "./owner-post-model";

const GUEST_KEY = "majestan_owner_draft_guest_v2";
function read(key: string): { draft: OwnerDraft | null; pending: boolean } {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return { draft: restoreDraft(raw?.draft ?? raw), pending: !!raw?.pending };
  } catch {
    return { draft: null, pending: false };
  }
}
function write(key: string, draft: OwnerDraft, pending: boolean) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ draft: persistableDraft(draft), pending }),
    );
  } catch {
    /* Browsers can disable local storage; server saving still works. */
  }
}
export function useOwnerDraft(token: string | null, userId?: number) {
  const [draft, setDraft] = useState<OwnerDraft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [loadedKey, setLoadedKey] = useState("");
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState<{
    guest: OwnerDraft;
    account: OwnerDraft;
  } | null>(null);
  const [revision, setRevision] = useState(0);
  const [loadRevision, setLoadRevision] = useState(0);
  const scope = useRef("");
  const generation = useRef(0);
  const dirty = useRef(false);
  const current = useRef(draft);
  useEffect(() => {
    current.current = draft;
  }, [draft]);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlight = useRef<Promise<unknown> | null>(null);
  const key =
    token && userId ? `majestan_owner_draft_user_${userId}_v2` : GUEST_KEY;

  useEffect(() => {
    const run = ++generation.current;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      const fromGuest = scope.current === GUEST_KEY || !scope.current;
      const guest = fromGuest
        ? hasProgress(current.current)
          ? current.current
          : read(GUEST_KEY).draft
        : null;
      scope.current = key;
      dirty.current = false;
      paused.current = false;
      setReady(false);
      setConflict(null);
      if (!token || !userId) {
        setDraft(read(GUEST_KEY).draft ?? emptyDraft());
        setLoadedKey(key);
        setReady(true);
        setStatus("Progress is saved on this device");
        return;
      }
      const local = read(key);
      ownerApi
        .draft(token, controller.signal)
        .then((res) => {
          if (generation.current !== run || controller.signal.aborted) return;
          const remote = restoreDraft(res.payload);
          const account =
            local.pending && local.draft
              ? local.draft
              : (remote ?? local.draft);
          if (guest && hasProgress(guest) && account && hasProgress(account)) {
            setConflict({ guest, account });
            setStatus("Choose which draft to continue");
            return;
          }
          const next = account ?? guest ?? emptyDraft();
          dirty.current = (!!guest && !account) || local.pending;
          setDraft(next);
          setLoadedKey(key);
          setReady(true);
          setStatus(
            dirty.current
              ? "Saving your progress…"
              : "Draft is saved to your account",
          );
          if (guest) {
            try {
              localStorage.removeItem(GUEST_KEY);
            } catch {
              /* optional storage */
            }
          }
        })
        .catch(() => {
          if (generation.current !== run || controller.signal.aborted) return;
          // Never overwrite an unread server draft after a connection failure.
          setDraft(local.draft ?? guest ?? emptyDraft());
          setLoadedKey(key);
          setReady(true);
          paused.current = true;
          setStatus(
            "Account draft could not load. Your changes stay on this device.",
          );
        });
    });
    return () => {
      controller.abort();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [token, userId, key, loadRevision]);

  useEffect(() => {
    if (!ready || loadedKey !== key || conflict || paused.current) return;
    write(key, draft, dirty.current);
    if (!token || !userId || !dirty.current) return;
    const run = generation.current;
    const snapshot = JSON.stringify(draft);
    timer.current = setTimeout(() => {
      const previous = saveInFlight.current ?? Promise.resolve();
      const promise = previous
        .catch(() => {})
        .then(() => {
          if (run !== generation.current || paused.current) return;
          return ownerApi.saveDraft(token, persistableDraft(draft));
        });
      saveInFlight.current = promise;
      promise
        .then(() => {
          if (run !== generation.current || paused.current) return;
          if (JSON.stringify(current.current) === snapshot) {
            dirty.current = false;
            write(key, current.current, false);
            setStatus("Draft is saved to your account");
          }
        })
        .catch(() => {
          if (run === generation.current)
            setStatus("Could not sync. Your draft is saved on this device.");
        })
        .finally(() => {
          if (saveInFlight.current === promise) saveInFlight.current = null;
        });
    }, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, ready, loadedKey, conflict, token, userId, key, revision]);

  const update = useCallback((fn: (d: OwnerDraft) => OwnerDraft) => {
    dirty.current = true;
    if (!paused.current)
      setStatus(
        scope.current === GUEST_KEY
          ? "Progress is saved on this device"
          : "Saving your progress…",
      );
    setDraft((prev) => {
      const next = cleanDraft(fn(prev));
      write(scope.current || GUEST_KEY, next, true);
      return next;
    });
  }, []);
  const choose = (choice: "guest" | "account") => {
    if (!conflict) return;
    dirty.current = choice === "guest";
    setDraft(conflict[choice]);
    setStatus(
      choice === "guest"
        ? "Saving your progress…"
        : "Draft is saved to your account",
    );
    setConflict(null);
    setLoadedKey(key);
    setReady(true);
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      /* optional storage */
    }
  };
  const pause = async () => {
    paused.current = true;
    if (timer.current) clearTimeout(timer.current);
    await saveInFlight.current?.catch(() => {});
  };
  const resume = () => {
    paused.current = false;
    setRevision((r) => r + 1);
  };
  const complete = () => {
    paused.current = true;
    dirty.current = false;
    if (timer.current) clearTimeout(timer.current);
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(GUEST_KEY);
    } catch {
      /* optional local storage */
    }
    setStatus("");
  };
  return {
    draft,
    update,
    ready: ready && loadedKey === key,
    status,
    conflict,
    choose,
    pause,
    resume,
    complete,
    reload: () => setLoadRevision((r) => r + 1),
  };
}
