import { unstable_rethrow } from "next/navigation";
import { buildRealEstateSchema } from "@/lib/schema-builder";
import { SeoHeadingProvider } from '@/components/seo/core-heading';
import { getSeo, getListingSeo, seoMetadata, withSeo, jsonLd, listingStructuredData } from '@/lib/seo-engine';
import { SeoOffMarketBanner, SeoOffMarketPage, SeoListingPage } from '@/components/seo/seo-content';
import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { SimilarProjects, SimilarProperties } from "@/components/site/listing/SimilarListings";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { PropertyDetailsView } from "@/components/site/property/PropertyDetailsView";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { getPropertyBySeoSlug } from "@/lib/api/property-by-slug";
import { buildFaqPageJsonLd } from "@/lib/faq-page-jsonld";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import {
  PROPERTY_TYPES,
  parsePseoSlug,
  buildPseoSlug,
  isSinglePageType,
  toLocationSlug,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";
import { getVisibleSingleSections } from "@/lib/property-sections";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { PropertyListingShell } from "@/components/search/PropertyListingShell";
import { ListingShellSkeleton } from "@/components/search/ListingPage";
import type { FilterValues } from "@/components/search/PropertySearchFilters";
import { searchProperties } from "@/lib/api";
import {
  getProjectBySlugUrl,
  ProjectApiError,
  formatINR as formatProjectINR,
} from "@/lib/api/projects";
import { ProjectNavigation } from "@/components/site/project/project-navigation";
import { ProjectDetailsView } from "@/components/site/project/ProjectDetailsView";
import { projectFaqItems } from "@/components/site/project/overview/faq-items";
import { ProjectTopActions } from "@/components/site/project/ProjectTopActions";
import { PAGE_CONTAINER } from "@/components/site/project/project-ui";

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
        toLocationSlug(s.city) === toLocationSlug(city) &&
        // Compare as slugs so multi-word names match: "sai-baba-colony"
        // ↔ "Sai Baba Colony".
        toLocationSlug(s.sublocation) === toLocationSlug(slug)
    );
    return match?.sublocation ?? slug;
  } catch {
    return slug;
  }
}

/**
 * No build-time prerender: this route used to enumerate the entire catalog
 * (every property slug + every PSEO combination) here, firing tens of
 * thousands of backend fetches from one IP during `next build` — tripping
 * the backend throttle (429 cascade) and spiking CPU on both containers.
 * With `dynamicParams: true` every URL still renders on demand and
 * ISR-caches per `revalidate`; the sitemap keeps exposing URLs to crawlers.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
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
  const engineSeo = await getSeo('/'+slug);
  const sourceSlug = engineSeo?.source_path?.replace(/^\//,'') || slug;

  if (RESERVED_SLUGS.has(slug)) {
    return {
      title: "Page Not Found | Majestan Realty",
      robots: { index: false, follow: false },
    };
  }

  if (engineSeo && !engineSeo.redirect) return seoMetadata(engineSeo);

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = engineSeo?.scope === "project" ? null : withSeo(await getPropertyBySeoSlug(sourceSlug) as any, engineSeo);
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
    const project = await getProjectBySlugUrl(sourceSlug).then(p => withSeo(p,engineSeo)).catch((error: unknown) => {
      if (error instanceof ProjectApiError && error.status === 404) return null;
      throw error;
    });
    if (project) {
      if ((project as any).shouldRedirect && (project as any).redirectDestination) permanentRedirect((project as any).redirectDestination);
      const canonicalPath = `/${project.canonicalSlug}`;
      const seo = project.seo?.seoData?.overview;
      const typeLabel = project.projectType === "villa" ? "Villa" : project.projectType === "plot" ? "Plot" : "Apartment";
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
  } catch (error) {
    unstable_rethrow(error);
    // Never cache a temporary project API failure as a missing listing.
    throw error;
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
  const engineSeo = await getSeo('/'+slug);
  const sourceSlug = engineSeo?.source_path?.replace(/^\//,'') || slug;
  // NOTE: searchParams must NOT be awaited here. Reading it at the top level
  // of the page poisons static prerendering (DYNAMIC_SERVER_USAGE → 500 on
  // every slug URL). It is awaited inside <PseoListingSection> below, which
  // always renders inside a <Suspense> boundary.

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  if (engineSeo?.redirect) permanentRedirect(engineSeo.redirect);
  if (engineSeo?.gone) notFound();
  if (engineSeo?.off_market && engineSeo?.target_snapshot) return <SeoOffMarketPage seo={engineSeo} />;
  if (engineSeo?.scope === 'listing' && engineSeo.config_key) {
    const query = await searchParams;
    return <SeoListingPage seo={engineSeo} page={Number(query?.page)||1}/>;
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = engineSeo?.scope === "project" ? null : withSeo(await getPropertyBySeoSlug(sourceSlug) as any, engineSeo);
  } catch (err) {
    console.error(`[SlugPage] Failed to fetch property for slug "${slug}":`, err);
    // Rethrow so error.tsx renders with a 5xx status: a 200 "Service
    // Unavailable" page got indexed and shown to visitors whenever the
    // backend was briefly unreachable or rate-limited.
    throw err;
  }

  if (property) {
    if (property.shouldRedirect) {
      permanentRedirect((property as any).redirectDestination || `/${property.canonicalSlug}`);
    }

    const structuredData = buildRealEstateSchema(property,engineSeo || undefined);
    const breadcrumbItems = buildBreadcrumbItems(property);
    // Every property page renders exactly one FAQ block (overview FAQs at
    // the end), so only those are marked up.
    const isSingle = isSinglePageType(property.propertyType);
    const faqJsonLd = engineSeo ? null : buildFaqPageJsonLd(
      (property.faqs || []).filter((f) => f.section === "overview"),
      `https://www.majestanrealty.com/${property.canonicalSlug}`,
    );

    return (
      <>
        <SiteHeader />
        {/* Spacer matching the fixed header's measured height */}
        <div className="h-[var(--site-header-h)]!" aria-hidden="true" />
        <PropertyNavigation
          slug={property.canonicalSlug}
          activeSection=""
          mode={isSingle ? "anchors" : "pages"}
          sections={isSingle ? getVisibleSingleSections(property) : undefined}
          propertyType={property.propertyType}
        />
        <div className="bg-[#f4f6f9]! min-h-screen! font-manrope">
          <div className={`${PAGE_CONTAINER} pt-5! pb-24!`}>
            <div className="mb-0!">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>
            <SeoOffMarketBanner seo={engineSeo} />
            <PropertyDetailsView property={property} />
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
          />
          {faqJsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          )}
        </div>
        <SimilarProperties propertyId={property.id} city={property.city} />
        <SiteFooter />
      </>
    );
  }

  try {
    const project = await getProjectBySlugUrl(sourceSlug).then(p => withSeo(p,engineSeo)).catch((error: unknown) => {
      if (error instanceof ProjectApiError && error.status === 404) return null;
      throw error;
    });
    if (project) {
      if ((project as any).shouldRedirect && (project as any).redirectDestination) permanentRedirect((project as any).redirectDestination);
      const breadcrumbItems = [
        { label: "Projects", href: "/projects" },
        { label: project.city, href: "/projects" },
        { label: project.name },
      ];
      const units = project.units.filter((u: any) => u.status === "available");
      const prices = units
        .map((u: any) => Number(u.price))
        .filter((n: number) => Number.isFinite(n) && n > 0);
      // The overview shows exactly one FAQ block (overview FAQs at the end),
      // so only those are marked up.
      const faqJsonLd = engineSeo ? null : buildFaqPageJsonLd(
        projectFaqItems(project).filter((f) => f.section === "overview"),
        `https://www.majestanrealty.com/${project.canonicalSlug}`,
      );
      return (
        <>
          <SiteHeader />
          <div className="min-h-screen! bg-[#f4f6f9]! font-manrope-page">
            {/* Spacer matching the fixed header's measured height */}
            <div className="h-[var(--site-header-h)]!" aria-hidden="true" />
            <ProjectNavigation
              slug={project.canonicalSlug}
              activeSection=""
              projectType={project.projectType}
            />
            {/* No width cap on <main>: the overview's cover runs edge to edge,
                so each block below sets its own page container instead. */}
            <main className="pt-3! pb-24! scroll-smooth!">
              <div className="flex! flex-col! gap-4!">
                <div className={`${PAGE_CONTAINER} w-full! flex! items-center! justify-between! gap-4! min-w-0!`}>
                  <div className="min-w-0! flex-1!">
                    <Breadcrumbs items={breadcrumbItems} jsonLd />
                  </div>
                  <ProjectTopActions project={project} />
                </div>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: jsonLd(buildRealEstateSchema(project,engineSeo || undefined)),
                  }}
                />
                {faqJsonLd && (
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify(faqJsonLd),
                    }}
                  />
                )}
                <div id="overview" className="scroll-mt-40!">
                  <SeoOffMarketBanner seo={engineSeo} />
                  <ProjectDetailsView project={project} />
                </div>
              </div>
            </main>
          </div>
          <SimilarProjects projectId={project.id} city={project.city} />
          <SiteFooter />
        </>
      );
    }
  } catch (error) {
    unstable_rethrow(error);
    // Never cache a temporary project API failure as a missing listing.
    throw error;
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
  if (engineSeo?.scope === 'page') return <SeoListingPage seo={engineSeo}/>;

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
    const listingSeo = await getListingSeo('/'+slug);
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
          includeProjects: true,
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
        <div className="h-[var(--site-header-h)]!" aria-hidden="true" />
        <SeoHeadingProvider heading={listingSeo?.h1}>
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
        </SeoHeadingProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(listingStructuredData(listingSeo, itemListJsonLd)) }}
        />
        <SiteFooter />
      </>
    );
  }
}
