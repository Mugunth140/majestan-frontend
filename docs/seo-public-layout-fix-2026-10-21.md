# Public SEO layout and child-route repair — 21 October 2026

The extra SEO blocks were removed from the public listing and main property/project overview layouts at the user's request. The normal listing results, galleries, details, headings and existing FAQ sections remain. SEO titles, descriptions, canonical/robots, OpenGraph and JSON-LD continue to be generated in the page source. No crawler-only rendering branch or CSS-hidden keyword content was added.

Listing structured data keeps the actual visible page of inventory and its breadcrumb/page nodes. FAQPage nodes for the removed listing FAQ block are excluded. Property/project FAQs that appear in their normal sections still retain their corresponding schema. This follows Google's [structured-data content guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

The photo/floor-plan/amenities/locality errors came from Next's static-to-dynamic runtime error on the direct `src/app/[slug]/[...section]` route. That route now uses `force-dynamic`, matching the main and SEO rewrite routes. Earlier tests only exercised child pages after creating SEO configs, which caused the force-dynamic SEO rewrite to hide the direct-route problem. The HTTP test now covers direct child URLs before saving any config.

Validation:

- 27 isolated API/database/production-SSR integration groups pass.
- 55 targeted content/schema/gallery tests pass; TypeScript and production Docker build pass.
- A temporary container was checked against the production backend before the switch.
- Twelve public production URLs returned HTTP 200 after deployment, including the reported listing, Alamo Turin, its four child pages, a property and its four child pages, and admin login.
- Served listing HTML contains ItemList JSON-LD without the extra market table/FAQ; main detail pages omit the extra fact/AI-summary sections.
- Inventory and sync APIs were not changed. Disposable test databases and temporary canary container were cleaned up.

Production was repaired with a targeted frontend artifact update based on the existing deployed image. The unchanged runtime dependencies/public assets were retained. Server artifacts are under `/home/mugunth/majestan/hotfixes/seo-20261021`; the previous image is retained as `ghcr.io/mugunth140/site-frontend:pre-seo-fix-20261021`.

The source changes are in this workspace and must be included in the next normal frontend push/build so a registry deployment retains this repair. No source commit or push was made automatically.
