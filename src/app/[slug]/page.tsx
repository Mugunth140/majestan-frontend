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
import { PropertyListingShell } from "@/components/search/PropertyListingShell";
import type { FilterValues } from "@/components/search/PropertySearchFilters";
import { searchProperties } from "@/lib/api";
import { getProjectBySlugUrl, getAllProjectSlugs, formatINR as formatProjectINR } from "@/lib/api/projects";
import { ProjectNavigation } from "@/components/site/project/project-navigation";
import { ProjectDetailsView } from "@/components/site/project/ProjectDetailsView";
import { ProjectFloorPlanSection } from "@/components/site/project/sections/ProjectFloorPlanSection";
import { ProjectPhotosSection } from "@/components/site/project/sections/ProjectPhotosSection";
import { ProjectAmenitiesSection } from "@/components/site/project/sections/ProjectAmenitiesSection";
import { ProjectLocalitySection } from "@/components/site/project/sections/ProjectLocalitySection";

export const dynamicParams = true;
// Bound the ISR full-route cache: crawler/scanner garbage URLs must not
// accumulate rendered pages in .next/cache indefinitely.
export const revalidate = 300;

export async function generateStaticParams() {
  const out: { slug: string }[] = [];
  try {
    const { API_BASE_URL } = await import("@/lib/api");
    const res = await fetch(`${API_BASE_URL}/properties/all-slugs`);
    if (res.ok) {
      const data = await res.json();
      const slugs: string[] = Array.isArray(data) ? data : (data.data || data.items || []);
      for (const slug of slugs) out.push({ slug });
    }
  } catch (error) {
    console.error("Failed to fetch slugs for static generation:", error);
  }
  try {
    const projectSlugs = await getAllProjectSlugs();
    for (const full of projectSlugs) {
      const clean = full.replace(/^\/+/, "");
      if (clean && !clean.includes("/")) out.push({ slug: clean });
    }
  } catch (error) {
    console.error("Failed to fetch project slugs for static generation:", error);
  }
  return out;
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

  try {
    const project = await getProjectBySlugUrl(slug).catch(() => null);
    if (project) {
      const canonicalPath = `/${project.canonicalSlug}`;
      const seo = project.seo?.seoData?.overview;
      const typeLabel = project.projectType === "villa" ? "Villa" : "Apartment";
      const bhkLabel = project.ranges.bhk.length ? `${project.ranges.bhk.join(", ")} BHK ` : "";
      const priceLabel = project.ranges.minPrice != null ? ` ${formatProjectINR(project.ranges.minPrice)}${project.ranges.maxPrice && project.ranges.maxPrice !== project.ranges.minPrice ? ` - ${formatProjectINR(project.ranges.maxPrice)}` : ""}` : "";
      const title = seo?.title || `${project.name} - ${bhkLabel}${typeLabel} in ${project.city} | Majestan Realty`;
      const description = seo?.description || `${project.name}, ${bhkLabel}${typeLabel.toLowerCase()} project in ${project.city}.${priceLabel ? ` Price${priceLabel}.` : ""} View configurations, floor plans, photos and locality details.`;
      const ogImage = seo?.og_image || project.coverImageUrl || undefined;
      return {
        title, description,
        alternates: { canonical: canonicalPath },
        openGraph: {
          title: seo?.og_title || title, description: seo?.og_description || description,
          url: canonicalPath, type: "article",
          ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }] } : {}),
        },
        twitter: {
          card: "summary_large_image", title: seo?.og_title || title, description: seo?.og_description || description,
          ...(ogImage ? { images: [ogImage] } : {}),
        },
      };
    }
  } catch { /* fall through to static/PSEO/404 */ }

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
        {/* Spacer matching fixed header height (64px constant across breakpoints) */}
        <div className="h-[64px]!" aria-hidden="true" />
        <PropertyNavigation
          slug={property.canonicalSlug}
          activeSection=""
        />
        <div className="bg-[#f8f9fa]! min-h-screen!">
          <div className="container! mx-auto! px-4! max-w-7xl! pt-5! pb-24!">
            <div className="mb-0!">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>
            <PropertyDetailsView property={property} />
          </div>
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

  try {
    const project = await getProjectBySlugUrl(slug).catch(() => null);
    if (project) {
      const breadcrumbItems = [
        { label: "Projects", href: "/projects" },
        { label: project.city, href: "/projects" },
        { label: project.name },
      ];
      const units = project.units.filter((u) => u.status === "available");
      const prices = units.map((u) => Number(u.price)).filter((n) => Number.isFinite(n) && n > 0);
      return (
        <>
          <SiteHeader />
          <div className="min-h-screen! bg-gray-50!">
            {/* Spacer matching fixed header height (64px) */}
            <div className="h-[64px]!" aria-hidden="true" />
            <ProjectNavigation />
            <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-5! pb-24! scroll-smooth!">
              <div className="flex! flex-col! gap-5!">
                <div className="mb-0!">
                  <Breadcrumbs items={breadcrumbItems} jsonLd />
                </div>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                  "@context": "https://schema.org", "@type": "ApartmentComplex",
                  name: project.name, url: `https://www.majestanrealty.com/${project.canonicalSlug}`,
                  address: { "@type": "PostalAddress", addressLocality: project.sublocation || project.city, addressRegion: project.city },
                  ...(prices.length ? { offers: { "@type": "AggregateOffer", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), priceCurrency: "INR", offerCount: units.length } } : {}),
                }) }} />
                <div id="overview" className="scroll-mt-40!">
                  <ProjectDetailsView project={project} />
                </div>
                <ProjectFloorPlanSection project={project} />
                <ProjectPhotosSection project={project} />
                <ProjectAmenitiesSection project={project} />
                <ProjectLocalitySection project={project} />
              </div>
            </main>
          </div>
          <SiteFooter />
        </>
      );
    }
  } catch { /* fall through to static/PSEO/404 */ }

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

    const pseoListingType = ((parsedPseo.listingType as "Sell" | "Rent") || "Sell");
    const pseoPropertyType = parsedPseo.propertyType || "apartment";
    const pseoCity = parsedPseo.city || "";
    const pseoLocation = parsedPseo.location || "";

    const pseoInitialFilters: FilterValues = {
      keyword: "",
      propertyType: pseoPropertyType,
      listingType: pseoListingType,
      location: pseoLocation,
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      bedrooms: "",
      facing: "",
      furnishing: "",
      propertyAge: "",
    };

    return (
      <>
        <SiteHeader />
        <PropertyListingShell
          adapterInit={{
            initialListingType: pseoListingType,
            initialPropertyType: pseoPropertyType,
            initialCity: pseoCity,
            initialLocality: parsedPseo.location,
          }}
          initialFilters={pseoInitialFilters}
          initialData={initialData}
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
