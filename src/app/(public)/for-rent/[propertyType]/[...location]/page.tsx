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
  const parsed = parseListingUrl("for-rent", p.propertyType, p.location);
  
  if (!parsed) {
    return { title: "Properties Not Found" };
  }

  const { propertyLabel, city, locality } = parsed;
  const locationLabel = locality ? `${locality}, ${city}` : city;
  
  return {
    title: `${propertyLabel} for Rent in ${locationLabel} | Majestan Realty`,
    description: `Explore the best ${propertyLabel.toLowerCase()} for rent in ${locationLabel}. View prices, photos, and floor plans.`,
    alternates: {
      canonical: `https://www.majestanrealty.com/for-rent/${p.propertyType}/${p.location.join('/')}`
    }
  };
}

export default async function ForRentListingPageRoute({ params, searchParams }: Props) {
  const p = await params;
  const sp = await searchParams;
  const parsed = parseListingUrl("for-rent", p.propertyType, p.location);

  if (!parsed) {
    notFound();
  }

  const page = Number(sp.page) || 1;
  const sort = typeof sp.sort === "string" ? sp.sort : "";

  let initialData = null;
  try {
    initialData = await searchProperties({
      listingType: parsed.apiListingType,
      propertyType: parsed.apiPropertyType,
      location: parsed.locality || parsed.city,
      page,
      sort,
      limit: 12,
    });
  } catch (error) {
    console.error("Failed to fetch initial properties", error);
  }

  return (
    <ListingPage 
      initialListingType={parsed.apiListingType}
      initialPropertyType={parsed.apiPropertyType}
      initialCity={parsed.city}
      initialLocality={parsed.locality}
      initialSearchData={initialData}
    />
  );
}
