// Server fetches require an absolute URL; NEXT_PUBLIC_API_BASE_URL may be /site-api.
export const SEO_API_BASE = (
  [process.env.API_BASE_URL, process.env.NEXT_PUBLIC_API_BASE_URL].find(
    (value) => value && /^https?:\/\//i.test(value),
  ) ||
  (process.env.SITE_BACKEND_URL
    ? process.env.SITE_BACKEND_URL.replace(/\/$/, "") + "/api/v1"
    : "http://localhost:5000/api/v1")
).replace(/\/$/, "");
