import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// NOTE ON REDIRECT STRATEGY (2026-09)
//
// All PSEO URL migration is handled by the old route handlers:
//   /for-sale/[propertyType]/[...location]/page.tsx
//   /for-rent/[propertyType]/[...location]/page.tsx
//
// Those routes call parseListingUrl + buildPseoSlug and issue a 308→301
// to the new canonical slug format.
//
// The redirects below handle OLDER legacy URL patterns that predate the
// /for-sale/... route structure. They redirect directly to the new canonical
// PSEO slug so there is only one redirect hop, never a chain.
//
// Pattern note: Next.js config :param matches a single path segment (no
// slashes), so `:location` here can only be a city name (e.g. "coimbatore").
// Sublocation + city combinations from these old URLs are not possible to
// capture without routing through the old route handler, which is fine for
// the rare cases they occur.
// ---------------------------------------------------------------------------

const nextConfig: NextConfig = {
  // Produce .next/standalone with a minimal server.js — the Docker runner
  // executes this with Node instead of `next start` under Bun (memory retention).
  output: "standalone",
  async redirects() {
    return [
      // ── 1. Stale SEO redirect entries ────────────────────────────────────
      // These pointed at old intermediary pages; send directly to new PSEO URLs.
      {
        source: "/seo_redirect/apartment",
        destination: "/apartments-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/seo_redirect/villa",
        destination: "/villas-for-sale-in-coimbatore",
        permanent: true,
      },

      // ── 2. Buy (Sell) category short-URLs ────────────────────────────────
      // Old format: /buy-apartments-coimbatore
      // New format: /apartments-for-sale-in-coimbatore
      // :location is always a single city slug here
      {
        source: "/buy-apartments-:location",
        destination: "/apartments-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-villas-:location",
        destination: "/villas-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-independent-houses-:location",
        destination: "/independent-houses-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-plots-:location",
        destination: "/plots-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-farmlands-:location",
        destination: "/farmlands-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-commercial-space-:location",
        destination: "/commercial-spaces-for-sale-in-:location",
        permanent: true,
      },
      {
        source: "/buy-industrials-:location",
        destination: "/industrial-spaces-for-sale-in-:location",
        permanent: true,
      },

      // ── 3. Rent category short-URLs ───────────────────────────────────────
      {
        source: "/rent-apartments-:location",
        destination: "/apartments-for-rent-in-:location",
        permanent: true,
      },
      {
        source: "/rent-villas-:location",
        destination: "/villas-for-rent-in-:location",
        permanent: true,
      },
      {
        source: "/rent-independent-houses-:location",
        destination: "/independent-houses-for-rent-in-:location",
        permanent: true,
      },
      {
        source: "/rent-co-working-:location",
        destination: "/coworking-for-rent-in-:location",
        permanent: true,
      },
      {
        source: "/rent-commercial-space-:location",
        destination: "/commercial-spaces-for-rent-in-:location",
        permanent: true,
      },
      {
        source: "/rent-industrials-:location",
        destination: "/industrial-spaces-for-rent-in-:location",
        permanent: true,
      },

      // ── 4. Footer SEO Landing Pages ───────────────────────────────────────
      // Old format: /apartment-sell-coimbatore  OR  /apartment-sell-coimbatore/2
      // Routed directly to new canonical PSEO city-level slug.
      // (The /page_num form goes to the city-level slug; pagination is handled
      //  client-side in the shell — no page-numbered PSEO URLs exist.)
      ...generateFooterRedirects(),

      // ── 5. Fallback MVC Property Directory ────────────────────────────────
      {
        source: "/property/apartment",
        destination: "/apartments-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/villa",
        destination: "/villas-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/plots",
        destination: "/plots-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/industrial",
        destination: "/industrial-spaces-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/farmland",
        destination: "/farmlands-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/independent-house",
        destination: "/independent-houses-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/commercial",
        destination: "/commercial-spaces-for-sale-in-coimbatore",
        permanent: true,
      },
      {
        source: "/property/coworking",
        destination: "/coworking-for-rent-in-coimbatore",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prismarkcrm.in", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Bound the image optimizer cache growth in .next/cache/images
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

// ---------------------------------------------------------------------------
// Footer redirects — old 3-part format: /apartment-sell-coimbatore
// Maps directly to new canonical PSEO city-level slugs.
// ---------------------------------------------------------------------------

function generateFooterRedirects() {
  const redirects: Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }> = [];

  // Maps old footer slug prefix → new PSEO property type slug
  const propertyTypes = [
    { slug: "apartment",      pseoSlug: "apartments" },
    { slug: "villa",          pseoSlug: "villas" },
    { slug: "independenthouse", pseoSlug: "independent-houses" },
    { slug: "plot",           pseoSlug: "plots" },
    { slug: "industrialspace", pseoSlug: "industrial-spaces" },
    { slug: "farmlands",      pseoSlug: "farmlands" },
    { slug: "commercialspace", pseoSlug: "commercial-spaces" },
    { slug: "coworking",      pseoSlug: "coworking" },
  ];

  const listingTypes = [
    { suffix: "sell", pseoWord: "for-sale" },
    { suffix: "rent", pseoWord: "for-rent" },
  ];

  for (const pt of propertyTypes) {
    for (const lt of listingTypes) {
      // /apartment-sell-coimbatore → /apartments-for-sale-in-coimbatore
      redirects.push({
        source: `/${pt.slug}-${lt.suffix}-:location`,
        destination: `/${pt.pseoSlug}-${lt.pseoWord}-in-:location`,
        permanent: true,
      });
      // Paginated form: /apartment-sell-coimbatore/2 — drop page, go to base PSEO URL
      redirects.push({
        source: `/${pt.slug}-${lt.suffix}-:location/:page_num`,
        destination: `/${pt.pseoSlug}-${lt.pseoWord}-in-:location`,
        permanent: true,
      });
    }
  }

  return redirects;
}
