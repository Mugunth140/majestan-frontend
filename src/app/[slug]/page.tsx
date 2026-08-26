import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { PropertyDetailsView } from "@/components/site/property/PropertyDetailsView";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { getPropertyBySeoSlug } from "@/lib/api/property-by-slug";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { parsePseoSlug } from "@/lib/seo/pseo-parser";
import { ListingPage } from "@/components/search/ListingPage";
import { searchProperties } from "@/lib/api";

export const dynamicParams = true;
// Bound the ISR full-route cache: crawler/scanner garbage URLs must not
// accumulate rendered pages in .next/cache indefinitely.
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const { API_BASE_URL } = await import("@/lib/api");
    const res = await fetch(`${API_BASE_URL}/properties/all-slugs`);
    if (!res.ok) return [];
    
    const data = await res.json();
    const slugs: string[] = Array.isArray(data) ? data : (data.data || data.items || []);
    
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Failed to fetch slugs for static generation:", error);
    return [];
  }
}

const RESERVED_SLUGS = new Set([
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "apple-touch-icon.png",
]);

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

function parseRobots(robotsStr?: string): { index: boolean; follow: boolean } {
  if (!robotsStr) return { index: true, follow: true };
  const [indexPart, followPart] = robotsStr.split(",");
  return {
    index: indexPart?.trim() === "index",
    follow: followPart?.trim() === "follow",
  };
}

const buildPropertyDescription = (
  description: string,
  city: string,
  propertyType: string
): string => {
  const trimmed = description.replace(/<[^>]*>/g, "").trim();
  if (trimmed.length > 0) {
    return trimmed.slice(0, 160);
  }

  const typeLabel =
    Object.values(PROPERTY_TYPES).find((p) => p.apiValue === propertyType)
      ?.label || propertyType;
  return `Explore this ${typeLabel.toLowerCase()} listing in ${city}. View photos, amenities, floor plans, and locality details.`;
};

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
    return {
      title: "Page Not Found | Majestan Realty",
      robots: { index: false, follow: false },
    };
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = await getPropertyBySeoSlug(slug);
  } catch (err) {
    console.error(`[generateMetadata] Failed to fetch property for slug "${slug}":`, err);
    return {
      title: "Majestan Realty",
      description: "Browse premium properties in India.",
      robots: { index: false, follow: true },
    };
  }

  if (property) {
    const canonicalPath = `/${property.canonicalSlug}`;

    const seoPage = property.seo?.seoData?.overview;

    const typeLabel =
      Object.values(PROPERTY_TYPES).find(
        (p) => p.apiValue === property.propertyType
      )?.label || property.propertyType;

    const title =
      seoPage?.title ||
      `${property.title} - ${typeLabel} in ${property.city} | Majestan Realty`;
    const description =
      seoPage?.description ||
      buildPropertyDescription(
        property.description,
        property.city,
        property.propertyType
      );
    const ogTitle = seoPage?.og_title || `${property.title} | Majestan Realty`;
    const ogDescription = seoPage?.og_description || description;
    const baseRobots = parseRobots(seoPage?.robots);
    const isIndexableStatus = property.status?.toLowerCase() === "available";
    const robots = {
      index: isIndexableStatus ? baseRobots.index : false,
      follow: baseRobots.follow,
    };

    const ogImages = seoPage?.og_image
      ? [
          {
            url: seoPage.og_image,
            width: 1200,
            height: 630,
            alt: `${property.title} - Property Image`,
          },
        ]
      : (property.images || [])
          .filter((img) => img.imageUrl)
          .map((img) => ({
            url: img.imageUrl,
            width: 1200,
            height: 630,
            alt: `${property.title} - Property Image`,
          }))
          .slice(0, 3);

    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: canonicalPath,
        type: "article",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
        images: seoPage?.og_image
          ? [seoPage.og_image]
          : (property.images || [])
              .filter((img) => img.imageUrl)
              .map((img) => img.imageUrl)
              .slice(0, 1),
      },
      robots: {
        ...robots,
        googleBot: {
          index: robots.index ?? true,
          follow: robots.follow ?? true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  const pathname = `/${slug}`;
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return {
      alternates: { canonical: pathname },
    };
  }

  // PSEO Parsing — doorway pages: noindex until they have unique copy + listings
  const parsedPseo = parsePseoSlug(slug);
  if (parsedPseo) {
    const loc = parsedPseo.location ? `${parsedPseo.location}, ` : "";
    const type = parsedPseo.propertyType 
      ? Object.values(PROPERTY_TYPES).find(p => p.apiValue === parsedPseo.propertyType)?.label || parsedPseo.propertyType 
      : "Properties";
    const cityText = parsedPseo.city || "Coimbatore";
    
    return {
      title: `${parsedPseo.bedrooms ? parsedPseo.bedrooms + ' BHK ' : ''}${type} ${parsedPseo.listingType === 'Rent' ? 'for Rent' : 'for Sale'} in ${loc}${cityText} | Majestan Realty`,
      description: `Explore top ${parsedPseo.bedrooms ? parsedPseo.bedrooms + ' BHK ' : ''}${type} in ${loc}${cityText}. Find your dream property today with Majestan Realty.`,
      alternates: { canonical: pathname },
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "Page Not Found | Majestan Realty",
    robots: { index: false, follow: false },
  };
}

function buildPropertyStructuredData(property: NonNullable<Awaited<ReturnType<typeof getPropertyBySeoSlug>>>) {
  const isSale = !property.status.toLowerCase().includes("rent");
  const typeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label || property.propertyType;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: buildPropertyDescription(
      property.description,
      property.city,
      property.propertyType
    ),
    url: `https://www.majestanrealty.com/${property.canonicalSlug}`,
    image: property.images?.map((image) => image.imageUrl) || [],
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: property.price,
      availability:
        property.status.toLowerCase() === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: property.country || "IN",
    },
    ...(property.details
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.details.areaSqft,
            unitCode: "FTK",
          },
          numberOfRooms: property.details.bedrooms,
          numberOfBathroomsTotal: property.details.bathrooms,
        }
      : {}),
  };
}

function buildBreadcrumbItems(property: NonNullable<Awaited<ReturnType<typeof getPropertyBySeoSlug>>>) {
  const isSale = !property.status.toLowerCase().includes("rent");
  const listingType = isSale ? "for-sale" : "for-rent";
  const listingLabel = isSale ? "For Sale" : "For Rent";
  const typeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label || property.propertyType;

  // Find the property type slug
  const propertyTypeSlug =
    Object.entries(PROPERTY_TYPES).find(
      ([, data]) => data.apiValue === property.propertyType
    )?.[0] || property.propertyType;

  return [
    {
      label: listingLabel,
      href: `/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`,
    },
    {
      label: typeLabel,
      href: `/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`,
    },
    {
      label: property.city,
      href: `/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`,
    },
    { label: property.title },
  ];
}

export default async function SlugPage({
  params,
}: SlugPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = await getPropertyBySeoSlug(slug);
  } catch (err) {
    console.error(`[SlugPage] Failed to fetch property for slug "${slug}":`, err);
    return (
      <div className="!min-h-[60vh] !flex !items-center !justify-center">
        <div className="!text-center !p-8 !bg-red-50 !rounded-2xl !max-w-md">
          <h2 className="!text-xl !font-bold !text-red-600 !mb-2">Service Unavailable</h2>
          <p className="!text-gray-600">The backend server could not be reached. Please make sure the backend is running on port 5000.</p>
        </div>
      </div>
    );
  }

  if (property) {
    if (property.shouldRedirect) {
      permanentRedirect(`/${property.canonicalSlug}`);
    }

    const structuredData = buildPropertyStructuredData(property);
    const breadcrumbItems = buildBreadcrumbItems(property);

    return (
      <>
        <SiteHeader />
        <div className="pt-25! bg-[#f8f9fa]! min-h-screen!">
          <div className="container! mx-auto! px-4! max-w-7xl! pt-2!">
            <Breadcrumbs items={breadcrumbItems} jsonLd />
            <div className="mb-2!">
              <PropertyNavigation
                slug={property.canonicalSlug}
                activeSection=""
              />
            </div>
          </div>
          <PropertyDetailsView property={property} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </div>
        <SiteFooter />
      </>
    );
  }

  const pathname = `/${slug}`;
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return (
      <>
        <SiteHeader />
        <div className="pt-[120px]!">
          <SitePage viewName={viewName} />
        </div>
        <SiteFooter />
      </>
    );
  }

  // Handle PSEO URL
  const parsedPseo = parsePseoSlug(slug);
  if (parsedPseo) {
    let initialData = null;
    try {
      initialData = await searchProperties({
        listingType: parsedPseo.listingType,
        propertyType: parsedPseo.propertyType,
        location: parsedPseo.location,
        city: parsedPseo.city,
        bedrooms: parsedPseo.bedrooms,
        page: 1,
        limit: 12,
      });
    } catch (error) {
      console.error("Failed to fetch initial properties", error);
    }

    const type = parsedPseo.propertyType 
      ? Object.values(PROPERTY_TYPES).find(p => p.apiValue === parsedPseo.propertyType)?.label || parsedPseo.propertyType 
      : "Properties";
    const loc = parsedPseo.location ? `${parsedPseo.location}, ` : "";
    const cityText = parsedPseo.city || "Coimbatore";
    
    const itemListJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${parsedPseo.bedrooms ? parsedPseo.bedrooms + ' BHK ' : ''}${type} ${parsedPseo.listingType === 'Rent' ? 'for Rent' : 'for Sale'} in ${loc}${cityText}`,
      "itemListElement": (initialData?.items || []).map((item: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.majestanrealty.com/${item.canonicalSlug}`
      }))
    };

    return (
      <>
        <SiteHeader />
        <ListingPage 
          initialListingType={(parsedPseo.listingType as "Sell" | "Rent") || "Sell"}
          initialPropertyType={parsedPseo.propertyType || "apartment"}
          initialCity={parsedPseo.city || ""}
          initialLocality={parsedPseo.location || ""}
          initialSearchData={initialData}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListJsonLd),
          }}
        />
        <SiteFooter />
      </>
    );
  }

  notFound();
}
