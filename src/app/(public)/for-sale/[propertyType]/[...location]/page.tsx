import { Suspense } from 'react';
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/search/ListingPage";
import { searchProperties } from "@/lib/api";
import { PROPERTY_TYPES, parseListingUrl } from "@/lib/seo-urls";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    propertyType: string;
    location: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const parsed = parseListingUrl("for-sale", p.propertyType, p.location);
  
  if (!parsed) {
    return { title: "Properties Not Found" };
  }

  const { propertyLabel, city, locality } = parsed;
  const locationLabel = locality ? `${locality}, ${city}` : city;
  
  return {
    title: `${propertyLabel} for Sale in ${locationLabel} | Majestan Realty`,
    description: `Explore the best ${propertyLabel.toLowerCase()} for sale in ${locationLabel}. View prices, photos, and floor plans.`,
    alternates: {
      canonical: `https://www.majestanrealty.com/for-sale/${p.propertyType}/${p.location.join('/')}`
    }
  };
}

export default async function ForSaleListingPageRoute({ params, searchParams }: Props) {
  const p = await params;
  const sp = await searchParams;
  const parsed = parseListingUrl("for-sale", p.propertyType, p.location);

  if (!parsed) {
    notFound();
  }

  // Pre-fetch data on server if no query params are changing sort/filters heavily
  // If there's a page or sort param, we can let client fetch, or we can fetch here too.
  const page = Number(sp.page) || 1;
  const sort = typeof sp.sort === "string" ? sp.sort : "";

  let initialData = null;
  try {
    initialData = await searchProperties({
      listingType: parsed.apiListingType,
      propertyType: parsed.apiPropertyType,
      location: parsed.locality,
      page,
      sort,
      limit: 12,
    });
  } catch (error) {
    console.error("Failed to fetch initial properties", error);
  }

  const itemListJsonLd = initialData?.items?.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${parsed.propertyLabel} for Sale in ${parsed.locality ? parsed.locality + ", " : ""}${parsed.city}`,
        itemListElement: initialData.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.majestanrealty.com/${item.canonicalSlug || item.slug_url || item.slug || ""}`,
        })),
      }
    : null;

  return (
    <Suspense fallback={<div className="min-h-screen mt-24 text-center">Loading properties...</div>}>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <ListingPage 
        initialListingType={parsed.apiListingType}
        initialPropertyType={parsed.apiPropertyType}
        initialCity={parsed.city}
        initialLocality={parsed.locality}
        initialSearchData={initialData}
      />
    </Suspense>
  );
}
