# Project and property page performance

The public URLs are unchanged. Inventory overviews render through an internal ISR route; inventory tabs render through a separate ISR section route. Search/listing pages retain request-dependent rendering and filters. Internal rendering URLs redirect to their public equivalents if accessed directly.

## What changed

- Public SEO snapshots use a 60-second data cache; organization schema uses a one-hour cache. Both are invalidated by authenticated SEO admin saves.
- Inventory fetches carry a public inventory tag. The page-level revalidation ceiling is five minutes; shorter fetch lifetimes can cause earlier regeneration.
- Code-suffixed inventory URLs avoid the separate routing-table request. Their redirect, canonical and off-market decisions still come from the SEO resolver. Custom inventory paths continue to use the routing service.
- CRM project create/update/status/delete operations now notify the frontend after the database change succeeds. Property hooks use the same authenticated helper. Failed notifications are logged; there is no hardcoded shared-secret fallback.
- Refreshes expire SEO and inventory snapshots, rewritten page destinations and inventory counts. Ordinary inventory updates no longer purge the entire root layout.
- Property overview content and locality prose render on the server; interactive controls remain client components.
- Galleries use responsive image variants for approved hosts. The project cover mounts only the active slide and uses a picture source for its mobile crop. Native lazy loading replaces unconditional JavaScript image prefetching. Photos do not wait for hydration to become visible.
- Inventory pages omit four unused legacy stylesheets. Google font CSS is discovered directly from the document head instead of through a stylesheet import.

## Deployment configuration

Set the same strong, private `REVALIDATE_SECRET` on the frontend and site backend. On the site backend, set `FRONTEND_URL` to the deployed frontend origin, for example `https://www.majestanrealty.com`. Neither variable belongs in a `NEXT_PUBLIC_` variable.

The local environment did not have a shared webhook secret configured. Verification used a temporary secret on a separate local production-mode server, without changing environment files or production data.

Deploy the frontend and backend changes together. A successful CRM update should produce an authenticated HTTP 200 from `/api/revalidate`; an invalid secret returns 401. For multiple frontend replicas, configure shared cache storage/invalidation so the webhook reaches every replica's cached data. Keep account, admin and enquiry responses outside the public cache.

## Verification

Production build and TypeScript checks passed. Targeted frontend tests cover route selection, custom listing filters, image loading/fallbacks, SEO output and cache invalidation. Backend tests cover committed project changes, rollback behavior and the authenticated webhook helper.

A local production-mode HTTP check verified:

| Check | Result |
|---|---|
| Project overview | HTTP 200, MISS followed by HIT |
| Property overview | HTTP 200, MISS followed by HIT |
| Amenities, floor plans, photos and locality tabs | HTTP 200, MISS followed by HIT |
| CRM invalidation | Next request MISS, repeat HIT |
| Missing inventory | HTTP 404 |
| Direct internal render URL | Permanent redirect to the public URL |
| Wrong refresh secret | HTTP 401 |
| Source HTML | Heading, canonical and JSON-LD present |

The final local run measured project overview TTFB at 407 ms cold / 11 ms warm and property overview TTFB at 259 ms cold / 8 ms warm. Project tabs returned warm responses in 5–7 ms. These are local server measurements, not Lighthouse results or predictions for production.

## Production follow-up

After deployment, compare repeated mobile PageSpeed runs for one real project and one real property. Record LCP, CLS, INP/field data, TTFB and transferred image/JavaScript sizes. Confirm crawler-visible HTML and canonical URLs with Search Console URL Inspection. The production score has not been remeasured as part of this local implementation.
