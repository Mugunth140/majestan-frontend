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

export const dynamic = "force-dynamic";

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
  } catch {
    property = null;
  }

  if (property) {
    const canonicalPath = `/${property.canonicalSlug}`;
    const description = buildPropertyDescription(
      property.description,
      property.city,
      property.propertyType
    );

    const typeLabel =
      Object.values(PROPERTY_TYPES).find(
        (p) => p.apiValue === property.propertyType
      )?.label || property.propertyType;

    return {
      title: `${property.title} - ${typeLabel} in ${property.city} | Majestan Realty`,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `${property.title} | Majestan Realty`,
        description,
        url: canonicalPath,
        type: "article",
        images: property.images
          .filter((image) => image.imageUrl)
          .map((image) => ({
            url: image.imageUrl,
            width: 1200,
            height: 630,
            alt: `${property.title} - Property Image`,
          }))
          .slice(0, 3),
      },
      twitter: {
        card: "summary_large_image",
        title: `${property.title} | Majestan Realty`,
        description,
        images: property.images
          .filter((image) => image.imageUrl)
          .map((image) => image.imageUrl)
          .slice(0, 1),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
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
    image: property.images.map((image) => image.imageUrl),
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
  } catch {
    property = null;
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
        <div className="pt-[120px]! bg-[#f8f9fa]! min-h-screen!">
          <div className="container! mx-auto! px-4! max-w-7xl! pt-4!">
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
  if (!viewName) {
    notFound();
  }

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
