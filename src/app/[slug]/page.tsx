import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { PropertyDetailsView } from "@/components/site/property/PropertyDetailsView";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { getPropertyBySeoSlug } from "@/lib/api/property-by-slug";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import {
  PROPERTY_TYPES,
  parsePseoSlug,
  buildPseoSlug,
  PSEO_BEDROOM_OPTIONS,
  BEDROOM_PROPERTY_TYPE_SLUGS,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { PropertyListingShell } from "@/components/search/PropertyListingShell";
import { ListingShellSkeleton } from "@/components/search/ListingPage";
import type { FilterValues } from "@/components/search/PropertySearchFilters";
import { searchProperties } from "@/lib/api";
import {
  getProjectBySlugUrl,
  getAllProjectSlugs,
  formatINR as formatProjectINR,
} from "@/lib/api/projects";
import { ProjectNavigation } from "@/components/site/project/project-navigation";
import { ProjectDetailsView } from "@/components/site/project/ProjectDetailsView";
import { ProjectFloorPlanSection } from "@/components/site/project/sections/ProjectFloorPlanSection";
import { ProjectPhotosSection } from "@/components/site/project/sections/ProjectPhotosSection";
import { ProjectAmenitiesSection } from "@/components/site/project/sections/ProjectAmenitiesSection";
import { ProjectLocalitySection } from "@/components/site/project/sections/ProjectLocalitySection";
import { batchHasPseoInventory, type PseoCheckParams } from "@/lib/pseo-inventory";

export const dynamicParams = true;
// Bound the ISR full-route cache: crawler/scanner garbage URLs must not
// accumulate rendered pages in .next/cache indefinitely.
export const revalidate = 300;

// Force per-request rendering: this route mixes property/project detail
// branches with a query-driven PSEO listing branch (searchParams + client
// useSearchParams). Any static-generation attempt of it bails out with
// DYNAMIC_SERVER_USAGE → 500 on every slug URL (seen on staging). Same
// precedent as the for-sale/for-rent redirect routes.
export const dynamic = "force-dynamic";

const _abs = (u: string | undefined) =>
  !!u && /^https?:\/\//i.test(u) ? u : undefined;
const API_BASE =
  _abs(process.env.API_BASE_URL) ||
  _abs(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

// Known cities for PSEO generation — keep in sync with sitemap.ts
const PSEO_CITIES = ["coimbatore"];

/**
 * Resolve a lowercase sublocation slug (as returned by parsePseoSlug) back to
 * the canonical display name stored in the backend (e.g. "saravanampatti" →
 * "Saravanampatti").  Falls back to the slug itself if lookup fails.
 */
async function resolveSublocName(slug: string | undefined, city: string): Promise<string | undefined> {
  if (!slug) return undefined;
  try {
    const res = await fetch(`${API_BASE}/metadata/sublocations`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return slug;
    const data = await res.json();
    const list: Array<{ sublocation: string; city: string }> =
      Array.isArray(data) ? data : data.data || data.items || [];
    const match = list.find(
      (s) =>
        s.city.toLowerCase() === city.toLowerCase() &&
        s.sublocation.toLowerCase() === slug.toLowerCase()
    );
    return match?.sublocation ?? slug;
  } catch {
    return slug;
  }
}

// Property type slugs that generate PSEO pages (exclude "properties" catch-all)
const PSEO_PROPERTY_TYPE_SLUGS = Object.keys(PROPERTY_TYPES).filter(
  (k) => k !== "properties" && PROPERTY_TYPES[k as PropertyTypeSlug].apiValue !== ""
) as PropertyTypeSlug[];

export async function generateStaticParams() {
  const out: { slug: string }[] = [];

  // ── Property slugs ────────────────────────────────────────────────────────
  try {
    const { API_BASE_URL } = await import("@/lib/api");
    const res = await fetch(`${API_BASE_URL}/properties/all-slugs`);
    if (res.ok) {
      const data = await res.json();
      const slugs: string[] = Array.isArray(data)
        ? data
        : data.data || data.items || [];
      for (const slug of slugs) out.push({ slug });
    }
  } catch (error) {
    console.error("Failed to fetch property slugs for static generation:", error);
  }

  // ── Project slugs ─────────────────────────────────────────────────────────
  try {
    const projectSlugs = await getAllProjectSlugs();
    for (const full of projectSlugs) {
      const clean = full.replace(/^\/+/, "");
      if (clean && !clean.includes("/")) out.push({ slug: clean });
    }
  } catch (error) {
    console.error("Failed to fetch project slugs for static generation:", error);
  }

  // ── PSEO slugs (inventory-gated) ──────────────────────────────────────────
  try {
    const subRes = await fetch(`${API_BASE}/metadata/sublocations`, {
      next: { revalidate: 3600 },
    });
    const subData = subRes.ok ? await subRes.json() : [];
    const sublocations: Array<{ sublocation: string; city: string }> =
      Array.isArray(subData) ? subData : subData.data || subData.items || [];

    const listingTypes: Array<"Sell" | "Rent"> = ["Sell", "Rent"];

    const inventoryChecks: Array<{
      slug: string;
      params: PseoCheckParams;
    }> = [];

    for (const city of PSEO_CITIES) {
      const citySublocations = sublocations.filter(
        (s) => s.city.toLowerCase() === city.toLowerCase()
      );

      for (const lt of listingTypes) {
        for (const ptSlug of PSEO_PROPERTY_TYPE_SLUGS) {
          // City-level page (no sublocation)
          inventoryChecks.push({
            slug: buildPseoSlug(lt, ptSlug, city),
            params: { listingType: lt, propertyTypeSlug: ptSlug, city },
          });

          // Sublocation-level pages
          for (const sub of citySublocations) {
            inventoryChecks.push({
              slug: buildPseoSlug(lt, ptSlug, city, sub.sublocation),
              params: {
                listingType: lt,
                propertyTypeSlug: ptSlug,
                city,
                sublocation: sub.sublocation,
              },
            });

            // BHK-segmented pages — residential types only, 2/3/4 BHK (1 excluded)
            if (BEDROOM_PROPERTY_TYPE_SLUGS.includes(ptSlug)) {
              for (const bhk of PSEO_BEDROOM_OPTIONS) {
                inventoryChecks.push({
                  slug: buildPseoSlug(lt, ptSlug, city, sub.sublocation, bhk),
                  params: {
                    listingType: lt,
                    propertyTypeSlug: ptSlug,
                    city,
                    sublocation: sub.sublocation,
                    bedrooms: bhk,
                  },
                });
              }
            }
          }
        }
      }
    }

    // Run inventory checks in small sequential batches to avoid 429s
    const allParams = inventoryChecks.map((c) => c.params);
    const allResults = await batchHasPseoInventory(allParams);
    for (let j = 0; j < inventoryChecks.length; j++) {
      if (allResults[j]) {
        out.push({ slug: inventoryChecks[j].slug });
      }
    }
  } catch (error) {
    console.error("Failed to generate PSEO static params:", error);
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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** First string value of a query param (Next searchParams may be string[]). */
function qsFirst(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

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
          .filter((img: any) => img.imageUrl)
          .map((img: any) => ({
            url: img.imageUrl,
            width: 1200,
            height: 630,
            alt: `${property.title} - Property Image`,
          }))
          .slice(0, 3);

    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
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
              .filter((img: any) => img.imageUrl)
              .map((img: any) => img.imageUrl)
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
      const bhkLabel = project.ranges.bhk.length
        ? `${project.ranges.bhk.join(", ")} BHK `
        : "";
      const priceLabel =
        project.ranges.minPrice != null
          ? ` ${formatProjectINR(project.ranges.minPrice)}${
              project.ranges.maxPrice &&
              project.ranges.maxPrice !== project.ranges.minPrice
                ? ` - ${formatProjectINR(project.ranges.maxPrice)}`
                : ""
            }`
          : "";
      const title =
        seo?.title ||
        `${project.name} - ${bhkLabel}${typeLabel} in ${project.city} | Majestan Realty`;
      const description =
        seo?.description ||
        `${project.name}, ${bhkLabel}${typeLabel.toLowerCase()} project in ${project.city}.${
          priceLabel ? ` Price${priceLabel}.` : ""
        } View configurations, floor plans, photos and locality details.`;
      const ogImage = seo?.og_image || project.coverImageUrl || undefined;
      return {
        title,
        description,
        alternates: { canonical: canonicalPath },
        openGraph: {
          title: seo?.og_title || title,
          description: seo?.og_description || description,
          url: canonicalPath,
          type: "article",
          ...(ogImage
            ? { images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }] }
            : {}),
        },
        twitter: {
          card: "summary_large_image",
          title: seo?.og_title || title,
          description: seo?.og_description || description,
          ...(ogImage ? { images: [ogImage] } : {}),
        },
      };
    }
  } catch {
    /* fall through to static/PSEO/404 */
  }

  const pathname = `/${slug}`;
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return { alternates: { canonical: pathname } };
  }

  // PSEO metadata — now uses canonical parsePseoSlug from seo-urls.ts
  const pseo = parsePseoSlug(slug);
  if (pseo) {
    const canonicalSubloc = await resolveSublocName(pseo.sublocation, pseo.city || "coimbatore");
    const locPart = canonicalSubloc
      ? `${canonicalSubloc}, `
      : "";
    const cityText = pseo.city
      ? pseo.city.charAt(0).toUpperCase() + pseo.city.slice(1)
      : "Coimbatore";
    const bhkPart = pseo.bedrooms ? `${pseo.bedrooms} BHK ` : "";
    const listingWord = pseo.listingType === "Rent" ? "for Rent" : "for Sale";
    const canonicalUrl = `https://www.majestanrealty.com/${slug}`;

    return {
      title: `${bhkPart}${pseo.propertyLabel} ${listingWord} in ${locPart}${cityText} | Majestan Realty`,
      description: `Explore top ${bhkPart.toLowerCase()}${pseo.propertyLabel.toLowerCase()} ${listingWord.toLowerCase()} in ${locPart}${cityText}. Find your dream property today with Majestan Realty.`,
      alternates: { canonical: canonicalUrl },
      // Index PSEO pages — they are inventory-gated so they have real listings
      robots: { index: true, follow: true },
      openGraph: {
        title: `${bhkPart}${pseo.propertyLabel} ${listingWord} in ${locPart}${cityText} | Majestan Realty`,
        description: `Explore top ${bhkPart.toLowerCase()}${pseo.propertyLabel.toLowerCase()} ${listingWord.toLowerCase()} in ${locPart}${cityText}.`,
        url: canonicalUrl,
        type: "website",
      },
    };
  }

  return {
    title: "Page Not Found | Majestan Realty",
    robots: { index: false, follow: false },
  };
}

function buildPropertyStructuredData(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyBySeoSlug>>>
) {
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
    image: property.images?.map((image: any) => image.imageUrl) || [],
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

function buildBreadcrumbItems(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyBySeoSlug>>>
) {
  const isSale = !property.status.toLowerCase().includes("rent");
  const listingType = isSale ? ("Sell" as const) : ("Rent" as const);
  const listingLabel = isSale ? "For Sale" : "For Rent";

  // Find the property type slug
  const ptEntry = Object.entries(PROPERTY_TYPES).find(
    ([, data]) => data.apiValue === property.propertyType
  );
  const ptSlug = (ptEntry?.[0] || "apartments") as PropertyTypeSlug;
  const typeLabel = ptEntry?.[1].label || property.propertyType;

  // Build canonical PSEO URL for the parent breadcrumb
  const parentSlug = buildPseoSlug(
    listingType,
    ptSlug,
    property.city.toLowerCase()
  );

  return [
    { label: listingLabel, href: `/${parentSlug}` },
    { label: typeLabel, href: `/${parentSlug}` },
    { label: property.city, href: `/${parentSlug}` },
    { label: property.title },
  ];
}

export default async function SlugPage({
  params,
  searchParams,
}: SlugPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  // NOTE: searchParams must NOT be awaited here. Reading it at the top level
  // of the page poisons static prerendering (DYNAMIC_SERVER_USAGE → 500 on
  // every slug URL). It is awaited inside <PseoListingSection> below, which
  // always renders inside a <Suspense> boundary.

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
          <p className="!text-gray-600">
            The backend server could not be reached. Please make sure the backend
            is running on port 5000.
          </p>
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
        <PropertyNavigation slug={property.canonicalSlug} activeSection="" />
        <div className="bg-[#f8f9fa]! min-h-screen! font-manrope">
          <div className="container! mx-auto! px-4! max-w-7xl! pt-5! pb-24!">
            <div className="mb-0!">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>
            <PropertyDetailsView property={property} />
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
      const units = project.units.filter((u: any) => u.status === "available");
      const prices = units
        .map((u: any) => Number(u.price))
        .filter((n: number) => Number.isFinite(n) && n > 0);
      return (
        <>
          <SiteHeader />
          <div className="min-h-screen! bg-gray-50! font-manrope">
            {/* Spacer matching fixed header height (64px) */}
            <div className="h-[64px]!" aria-hidden="true" />
            <ProjectNavigation />
            <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-5! pb-24! scroll-smooth!">
              <div className="flex! flex-col! gap-5!">
                <div className="mb-0!">
                  <Breadcrumbs items={breadcrumbItems} jsonLd />
                </div>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "ApartmentComplex",
                      name: project.name,
                      url: `https://www.majestanrealty.com/${project.canonicalSlug}`,
                      address: {
                        "@type": "PostalAddress",
                        addressLocality: project.sublocation || project.city,
                        addressRegion: project.city,
                      },
                      ...(prices.length
                        ? {
                            offers: {
                              "@type": "AggregateOffer",
                              lowPrice: Math.min(...prices),
                              highPrice: Math.max(...prices),
                              priceCurrency: "INR",
                              offerCount: units.length,
                            },
                          }
                        : {}),
                    }),
                  }}
                />
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
  } catch {
    /* fall through to static/PSEO/404 */
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

  // ── PSEO page handler ─────────────────────────────────────────────────────
  // searchParams is read inside <PseoListingSection> (always under Suspense)
  // so the page shell stays statically prerenderable.
  const pseo = parsePseoSlug(slug);
  if (pseo) {
    return (
      <Suspense fallback={<ListingShellSkeleton />}>
        <PseoListingSection slug={slug} pseo={pseo} searchParams={searchParams} />
      </Suspense>
    );
  }

  notFound();
}

/**
 * PSEO listing section. Awaits searchParams here (inside Suspense) so the
 * query-string filters seed the same results the client will fetch for its
 * mount key (filtersFromParams + sort + page). Otherwise the unfiltered seed
 * is accepted as fresh and the first paint is wrong.
 */
async function PseoListingSection({
  slug,
  pseo,
  searchParams,
}: {
  slug: string;
  pseo: NonNullable<ReturnType<typeof parsePseoSlug>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const query = (await searchParams) ?? {};
  {
    // Resolve the sublocation slug ("saravanampatti") → canonical name
    // ("Saravanampatti") so the filter dropdown and syncUrl comparisons match.
    const canonicalSubloc = await resolveSublocName(pseo.sublocation, pseo.city || "coimbatore");

    const qOrUndef = (v: string) => (v.trim() !== "" ? v : undefined);
    const qBedrooms = qsFirst(query.bedrooms);
    const qLocation = qsFirst(query.location);
    const qSort = qsFirst(query.sort);
    const qPage = Math.max(1, parseInt(qsFirst(query.page), 10) || 1);
    const seedLocation = qLocation || canonicalSubloc;
    const seedBedrooms =
      qBedrooms || (pseo.bedrooms != null ? String(pseo.bedrooms) : "");

    let initialData = null;
    try {
      initialData = await searchProperties(
        {
          listingType: pseo.listingType,
          propertyType: pseo.propertyType,
          location: seedLocation,
          city: pseo.city,
          propertyName: qOrUndef(qsFirst(query.keyword)),
          minPrice: qOrUndef(qsFirst(query.minPrice)),
          maxPrice: qOrUndef(qsFirst(query.maxPrice)),
          minArea: qOrUndef(qsFirst(query.minArea)),
          maxArea: qOrUndef(qsFirst(query.maxArea)),
          bedrooms: seedBedrooms || undefined,
          facing: qOrUndef(qsFirst(query.facing)),
          furnishing: qOrUndef(qsFirst(query.furnishing)),
          propertyAge: qOrUndef(qsFirst(query.propertyAge)),
          sort: qSort || undefined,
          page: qPage,
          limit: 12,
        },
        undefined,   // no ISR tags (avoids 429 via fetch deduplication)
        300,         // time-based ISR: revalidate every 5 min (matches page revalidate)
      );
    } catch (error) {
      console.error("Failed to fetch initial PSEO properties:", error);
    }

    const cityLabel = pseo.city
      ? pseo.city.charAt(0).toUpperCase() + pseo.city.slice(1)
      : "Coimbatore";
    const subLabel = canonicalSubloc
      ? canonicalSubloc.replace(/-/g, " ")
      : undefined;
    const listingWord = pseo.listingType === "Rent" ? "for Rent" : "for Sale";
    const bhkPart = pseo.bedrooms ? `${pseo.bedrooms} BHK ` : "";

    const itemListJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${bhkPart}${pseo.propertyLabel} ${listingWord} in ${subLabel ? subLabel + ", " : ""}${cityLabel}`,
      url: `https://www.majestanrealty.com/${slug}`,
      itemListElement: (initialData?.items || []).map((item: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.majestanrealty.com/${item.canonicalSlug || item.slug_url || item.slug || ""}`,
      })),
    };

    const pseoInitialFilters: FilterValues = {
      keyword: qsFirst(query.keyword),
      propertyType: pseo.propertyType,
      listingType: pseo.listingType,
      location: seedLocation || "",
      minPrice: qsFirst(query.minPrice),
      maxPrice: qsFirst(query.maxPrice),
      minArea: qsFirst(query.minArea),
      maxArea: qsFirst(query.maxArea),
      bedrooms: seedBedrooms,
      facing: qsFirst(query.facing),
      furnishing: qsFirst(query.furnishing),
      propertyAge: qsFirst(query.propertyAge),
    };

    return (
      <>
        <SiteHeader />
        <Suspense fallback={<ListingShellSkeleton />}>
          <PropertyListingShell
            adapterInit={{
              initialListingType: pseo.listingType,
              initialPropertyType: pseo.propertyType,
              initialCity: pseo.city || "coimbatore",
              initialLocality: canonicalSubloc,
              initialBedrooms: pseo.bedrooms,
            }}
            initialFilters={pseoInitialFilters}
            initialData={initialData}
          />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <SiteFooter />
      </>
    );
  }
}
