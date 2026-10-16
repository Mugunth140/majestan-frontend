/**
 * Marks this server's own calls to the site backend with INTERNAL_API_KEY
 * (shared via the same env file), so the backend doesn't rate-limit every
 * server-rendered page as one IP. One aggressive crawler used to exhaust that
 * shared budget and real visitors got "Service Unavailable" pages.
 *
 * Wraps fetch once at server start instead of touching every API helper.
 * Browser calls go through /site-api (middleware.ts), which forwards the
 * visitor's IP so those stay limited per visitor. No key set = no change.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const key = process.env.INTERNAL_API_KEY;
  if (!key) return;

  const abs = (u: string | undefined) => (u && /^https?:\/\//i.test(u) ? u : undefined);
  const base =
    abs(process.env.API_BASE_URL) || abs(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://localhost:5000/api/v1";
  const backendOrigin = new URL(base).origin;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(backendOrigin)) return originalFetch(input, init);
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set("x-internal-key", key);
    return originalFetch(input, { ...init, headers });
  };
}
