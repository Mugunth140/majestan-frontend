/** Analytics must also work on browsers without the newer AbortSignal helpers. */
export function analyticsAbort(milliseconds: number) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let signal = controller.signal;
  try {
    if (
      typeof AbortSignal !== "undefined" &&
      typeof AbortSignal.any === "function" &&
      typeof AbortSignal.timeout === "function"
    ) {
      signal = AbortSignal.any([signal, AbortSignal.timeout(milliseconds)]);
    } else {
      timer = setTimeout(() => controller.abort(), milliseconds);
    }
  } catch {
    // A partially implemented/polyfilled API must not affect the page either.
    timer = setTimeout(() => controller.abort(), milliseconds);
  }
  return {
    signal,
    cancel() {
      if (timer !== undefined) clearTimeout(timer);
    },
    abort() {
      if (timer !== undefined) clearTimeout(timer);
      controller.abort();
    },
  };
}
