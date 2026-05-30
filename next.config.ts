import type { NextConfig } from "next";

function generateFooterRedirects() {
  const redirects = [];
  const propertyTypes = [
    { slug: "apartment", mapped: "apartments" },
    { slug: "villa", mapped: "villas" },
    { slug: "independenthouse", mapped: "independent-houses" },
    { slug: "plot", mapped: "plots" },
    { slug: "industrialspace", mapped: "industrial-spaces" },
    { slug: "farmlands", mapped: "farmlands" },
    { slug: "commercialspace", mapped: "commercial-spaces" },
    { slug: "coworking", mapped: "coworking" },
  ];

  const listingTypes = ["sell", "rent"];

  for (const pt of propertyTypes) {
    for (const lt of listingTypes) {
      const listingPrefix = lt === "sell" ? "for-sale" : "for-rent";
      redirects.push({
        source: `/${pt.slug}-${lt}-:location`,
        destination: `/${listingPrefix}/${pt.mapped}/:location`,
        permanent: true,
      });
      // Handle the pagination optional parameter format
      redirects.push({
        source: `/${pt.slug}-${lt}-:location/:page_num`,
        destination: `/${listingPrefix}/${pt.mapped}/:location?page=:page_num`,
        permanent: true,
      });
    }
  }

  return redirects;
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 1. Specific SEO 301 Redirects (Chain to the new location)
      {
        source: "/seo_redirect/apartment",
        destination: "/buy-apartments-coimbatore",
        permanent: true,
      },
      {
        source: "/seo_redirect/villa",
        destination: "/buy-villas-coimbatore",
        permanent: true,
      },

      // 2. Buy (Sell) Categories
      {
        source: "/buy-apartments-:location",
        destination: "/for-sale/apartments/:location",
        permanent: true,
      },
      {
        source: "/buy-villas-:location",
        destination: "/for-sale/villas/:location",
        permanent: true,
      },
      {
        source: "/buy-independent-houses-:location",
        destination: "/for-sale/independent-houses/:location",
        permanent: true,
      },
      {
        source: "/buy-plots-:location",
        destination: "/for-sale/plots/:location",
        permanent: true,
      },
      {
        source: "/buy-farmlands-:location",
        destination: "/for-sale/farmlands/:location",
        permanent: true,
      },
      {
        source: "/buy-commercial-space-:location",
        destination: "/for-sale/commercial-spaces/:location",
        permanent: true,
      },
      {
        source: "/buy-industrials-:location",
        destination: "/for-sale/industrial-spaces/:location",
        permanent: true,
      },

      // 3. Rent Categories
      {
        source: "/rent-apartments-:location",
        destination: "/for-rent/apartments/:location",
        permanent: true,
      },
      {
        source: "/rent-villas-:location",
        destination: "/for-rent/villas/:location",
        permanent: true,
      },
      {
        source: "/rent-independent-houses-:location",
        destination: "/for-rent/independent-houses/:location",
        permanent: true,
      },
      {
        source: "/rent-co-working-:location",
        destination: "/for-rent/coworking/:location",
        permanent: true,
      },
      {
        source: "/rent-commercial-space-:location",
        destination: "/for-rent/commercial-spaces/:location",
        permanent: true,
      },
      {
        source: "/rent-industrials-:location",
        destination: "/for-rent/industrial-spaces/:location",
        permanent: true,
      },

      // 4. Footer SEO Landing Pages (3-Part Routing)
      ...generateFooterRedirects(),

      // 5. Fallback MVC Property Directory
      {
        source: "/property/apartment",
        destination: "/for-sale/apartments/coimbatore",
        permanent: true,
      },
      {
        source: "/property/villa",
        destination: "/for-sale/villas/coimbatore",
        permanent: true,
      },
      {
        source: "/property/plots",
        destination: "/for-sale/plots/coimbatore",
        permanent: true,
      },
      {
        source: "/property/industrial",
        destination: "/for-sale/industrial-spaces/coimbatore",
        permanent: true,
      },
      {
        source: "/property/farmland",
        destination: "/for-sale/farmlands/coimbatore",
        permanent: true,
      },
      {
        source: "/property/independent-house",
        destination: "/for-sale/independent-houses/coimbatore",
        permanent: true,
      },
      {
        source: "/property/commercial",
        destination: "/for-sale/commercial-spaces/coimbatore",
        permanent: true,
      },
      {
        source: "/property/coworking",
        destination: "/for-rent/coworking/coimbatore",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'prismarkcrm.in', pathname: '/**' },
    ],
  },
};

export default nextConfig;
