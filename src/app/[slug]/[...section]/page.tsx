import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import {
  SimilarProjects,
  SimilarProperties,
} from "@/components/site/listing/SimilarListings";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { AmenitiesSection } from "@/components/site/property/sections/AmenitiesSection";
import { FloorPlanSection } from "@/components/site/property/sections/FloorPlanSection";
import { LocalitySection } from "@/components/site/property/sections/LocalitySection";
import { PhotosSection } from "@/components/site/property/sections/PhotosSection";
import { PropertyInfoSidebar } from "@/components/site/property/PropertyInfoSidebar";
import { PropertyTopActions } from "@/components/site/property/PropertyTopActions";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import propertyStyles from "@/components/site/property/property-details.module.css";
import { PAGE_CONTAINER } from "@/components/site/project/project-ui";
import { ProjectNavigation } from "@/components/site/project/project-navigation";
import { ProjectAmenitiesSection } from "@/components/site/project/sections/ProjectAmenitiesSection";
import { ProjectFloorPlanSection } from "@/components/site/project/sections/ProjectFloorPlanSection";
import { ProjectLocalitySection } from "@/components/site/project/sections/ProjectLocalitySection";
import { ProjectPhotosSection } from "@/components/site/project/sections/ProjectPhotosSection";
import { ProjectTopActions } from "@/components/site/project/ProjectTopActions";
import {
  ProjectSectionTitle,
  ProjectShell,
} from "@/components/site/project/ProjectShell";
import { projectFaqItems } from "@/components/site/project/overview/faq-items";
import { FaqOverview } from "@/components/site/project/overview/FaqOverview";
import { ProjectHelpSection } from "@/components/site/project/overview/ProjectHelpSection";
import { OV_ROOT } from "@/components/site/project/overview/overview-ui";
import { getProjectBySlugUrl } from "@/lib/api/projects";
import type { ProjectDetail } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { amenitiesPageLabel, hasFurnishing } from "@/lib/project-overview";
import {
  getPropertyBySeoSlug,
  type SeoProperty,
} from "@/lib/api/property-by-slug";
import { buildFaqPageJsonLd } from "@/lib/faq-page-jsonld";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { workspaceAmenitySuffix } from "@/lib/property-sections";
import {
  getSeo,
  jsonLd,
  seoMetadata,
  SEO_SITE,
  type SeoSnapshot,
} from "@/lib/seo-engine";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

function parseRobots(robotsStr?: string): { index: boolean; follow: boolean } {
  if (!robotsStr) return { index: true, follow: true };
  const [indexPart, followPart] = robotsStr.split(",");
  return {
    index: indexPart?.trim() === "index",
    follow: followPart?.trim() === "follow",
  };
}

import {
  TextBlock,
  SeoOffMarketBanner,
  SeoOffMarketPage,
} from "@/components/seo/seo-content";
import { FaqSection } from "@/components/site/property/sections/FaqSection";

export const dynamicParams = true;
// Both inventory and SEO metadata are resolved per request. Direct child
// routes must use the same rendering mode as the SEO rewrite routes.
export const dynamic = "force-dynamic";

const RESERVED_SECTION_SLUGS = new Set(["assets"]);

type PropertySectionPageProps = {
  params: Promise<{ slug: string; section: string[] }>;
};

function getSectionSeo(rootSeo: SeoSnapshot | null, sectionKey: string) {
  const key =
    sectionKey === "floor-plan" || sectionKey === "floor-plans"
      ? "floor_plan"
      : sectionKey.replace(/-([a-z])/g, (_, letter: string) =>
          letter.toUpperCase(),
        );
  const sectionSeo = rootSeo?.section_seo || rootSeo?.sectionSeo || {};
  const snakeKey = key.replace(
    /[A-Z]/g,
    (letter: string) => `_${letter.toLowerCase()}`,
  );
  return (
    sectionSeo[sectionKey.replaceAll("-", "_")] ||
    sectionSeo[sectionKey] ||
    sectionSeo[key] ||
    sectionSeo[snakeKey] ||
    (key === "floor_plan" ? sectionSeo.floor_plans : undefined) ||
    {}
  );
}

async function getEffectiveRootSeo(slug: string): Promise<SeoSnapshot | null> {
  let seo = await getSeo(`/${slug}`);
  for (let redirects = 0; seo?.redirect && redirects < 2; redirects += 1) {
    let target = String(seo.redirect);
    if (/^https?:\/\//i.test(target)) target = new URL(target).pathname;
    if (!target.startsWith("/")) target = `/${target}`;
    seo = await getSeo(target);
  }
  return seo;
}

function field(
  value: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const candidate = value?.[key];
    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !/\{\{?[^{}]+\}\}?/.test(candidate)
    ) {
      return candidate.trim();
    }
  }
  return undefined;
}

function robotsValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["index", "follow", "true", "1"].includes(normalized)) return true;
    if (["noindex", "nofollow", "false", "0"].includes(normalized))
      return false;
  }
  return undefined;
}

function childRobots(
  rootSeo: SeoSnapshot | null,
  childSeo: Record<string, unknown>,
  legacy?: Record<string, unknown> | null,
) {
  const fallback = {
    index: robotsValue(rootSeo?.robots_index) ?? true,
    follow: robotsValue(rootSeo?.robots_follow) ?? true,
  };
  const legacyParts: { index?: boolean; follow?: boolean } =
    typeof legacy?.robots === "string" ? parseRobots(legacy.robots) : {};
  const childParts: { index?: boolean; follow?: boolean } =
    typeof childSeo.robots === "string" ? parseRobots(childSeo.robots) : {};
  return {
    index:
      fallback.index &&
      (robotsValue(childSeo.robots_index ?? childSeo.robotsIndex) ??
        childParts.index ??
        robotsValue(legacy?.robots_index ?? legacy?.robotsIndex) ??
        legacyParts.index ??
        true),
    follow:
      robotsValue(childSeo.robots_follow ?? childSeo.robotsFollow) ??
      childParts.follow ??
      robotsValue(legacy?.robots_follow ?? legacy?.robotsFollow) ??
      legacyParts.follow ??
      fallback.follow,
  };
}

function absoluteUrl(path: string): string {
  return /^https?:\/\//i.test(path)
    ? path
    : `${SEO_SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

function schemaKeywords(seo: SeoSnapshot | null): string[] | undefined {
  const sources = [
    seo?.schema_keywords,
    seo?.schemaKeywords,
    seo?.keywords,
    seo?.settings?.schema_keywords,
    seo?.settings?.schemaKeywords,
    seo?.settings?.keywords,
    seo?.settings?.focus_keyword,
    seo?.settings?.focusKeyword,
    seo?.settings?.secondary_keywords,
    seo?.settings?.secondaryKeywords,
  ];
  const words = sources
    .flatMap((source: unknown) => {
      if (Array.isArray(source)) return source;
      return typeof source === "string" ? source.split(",") : [];
    })
    .filter(
      (word: unknown): word is string =>
        typeof word === "string" && !!word.trim(),
    )
    .map((word: string) => word.trim());
  return words.length ? [...new Set(words)] : undefined;
}

const SECTION_META: Record<
  string,
  {
    titlePrefix: string;
    descriptionPrefix: string;
    descriptionSuffix: string;
  }
> = {
  amenities: {
    titlePrefix: "Amenities",
    descriptionPrefix: "Discover amenities and facilities available at",
    descriptionSuffix:
      "including security, parking, power backup, and lifestyle features.",
  },
  locality: {
    titlePrefix: "Locality",
    descriptionPrefix: "Explore the locality and neighbourhood of",
    descriptionSuffix:
      "with nearby schools, hospitals, shopping malls, and transport connectivity.",
  },
  "floor-plan": {
    titlePrefix: "Floor Plan",
    descriptionPrefix: "View floor plans and unit layouts for",
    descriptionSuffix:
      "including area details, configurations, and key measurements.",
  },
  photos: {
    titlePrefix: "Photos",
    descriptionPrefix: "Browse the complete photo gallery of",
    descriptionSuffix: "featuring interior, exterior, and amenity photographs.",
  },
};

// Project sub-pages — one URL per section for all three project types,
// mirroring the property multi-page structure.
const PROJECT_SECTION_META: Record<
  string,
  {
    titlePrefix: string;
    descriptionPrefix: string;
    descriptionSuffix: string;
  }
> = {
  amenities: {
    // Title prefix is replaced with amenitiesPageLabel(projectType) at use.
    titlePrefix: "Amenities",
    descriptionPrefix: "Discover amenities and facilities available at",
    descriptionSuffix: "from everyday conveniences to lifestyle features.",
  },
  "floor-plans": {
    // Title prefix is replaced with getFloorPlanLabel(projectType) at use.
    titlePrefix: "Floor Plan",
    descriptionPrefix: "View layouts and configurations for",
    descriptionSuffix:
      "including area details, configurations, and key measurements.",
  },
  locality: {
    titlePrefix: "Locality",
    descriptionPrefix: "Explore the locality and neighbourhood of",
    descriptionSuffix: "with nearby essentials and transport connectivity.",
  },
  photos: {
    titlePrefix: "Photos",
    descriptionPrefix: "Browse the complete photo gallery of",
    descriptionSuffix:
      "featuring project exteriors, layouts, locality views and videos.",
  },
};

/** The sub-page titles, named as the overview names its sections. */
const PROJECT_SECTION_TITLES: Record<string, string> = {
  locality: "Location",
  photos: "Photos and videos",
};

function projectSectionHeading(
  sectionKey: string,
  projectType: string,
): string {
  if (sectionKey === "floor-plans")
    return `${getFloorPlanLabel(projectType)} & Configurations`;
  if (sectionKey === "amenities") return amenitiesPageLabel(projectType);
  return PROJECT_SECTION_TITLES[sectionKey];
}

/** The meta description, which names furnishing where the page holds it. */
function projectSectionDescription(
  sectionKey: string,
  project: ProjectDetail,
): string {
  const config = PROJECT_SECTION_META[sectionKey];
  if (sectionKey === "amenities" && hasFurnishing(project.projectType)) {
    return `Discover the amenities and furnishing at ${project.name} in ${project.city}, from shared facilities to what comes fitted in each unit.`;
  }
  return `${config.descriptionPrefix} ${project.name} in ${project.city}. ${config.descriptionSuffix}`;
}

function projectTypeLabel(projectType: string): string {
  if (projectType === "villa") return "Villa";
  if (projectType === "plot") return "Plot";
  return "Apartment";
}

function projectSectionTitlePrefix(
  sectionKey: string,
  projectType: string,
): string {
  if (sectionKey === "floor-plans") return getFloorPlanLabel(projectType);
  if (sectionKey === "amenities") return amenitiesPageLabel(projectType);
  return PROJECT_SECTION_META[sectionKey]?.titlePrefix ?? sectionKey;
}

function buildBreadcrumbItems(property: SeoProperty, sectionLabel: string) {
  const isSale = !property.status.toLowerCase().includes("rent");
  const listingType = isSale ? "for-sale" : "for-rent";
  const listingLabel = isSale ? "For Sale" : "For Rent";
  const typeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType,
    )?.label || property.propertyType;

  const propertyTypeSlug =
    Object.entries(PROPERTY_TYPES).find(
      ([, data]) => data.apiValue === property.propertyType,
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
      label: property.title,
      href: `/${property.canonicalSlug}`,
    },
    { label: sectionLabel },
  ];
}

export async function generateMetadata({
  params,
}: PropertySectionPageProps): Promise<Metadata> {
  const { slug, section } = await params;
  const rootSeo = await getEffectiveRootSeo(slug);

  if (RESERVED_SECTION_SLUGS.has(slug)) {
    return {
      title: { absolute: "Page Not Found | Majestan Realty" },
      robots: { index: false, follow: false },
    };
  }

  if (rootSeo?.off_market && rootSeo?.target_snapshot) {
    const allowed =
      rootSeo.scope === "project" ? PROJECT_SECTION_META : SECTION_META;
    if (section.length !== 1 || !allowed[section[0]])
      return { robots: { index: false, follow: false } };
    const child = getSectionSeo(rootSeo, section[0]);
    return seoMetadata({
      ...rootSeo,
      ...child,
      meta_title:
        field(child, "meta_title", "metaTitle", "title") ||
        `${rootSeo.target_snapshot.name || rootSeo.target_snapshot.title} ${allowed[section[0]].titlePrefix} | Majestan Realty`,
      canonical_url: absoluteUrl(
        field(child, "canonical_url", "canonicalUrl") ||
          `${rootSeo.path}/${section[0]}`,
      ),
      ...Object.fromEntries(
        Object.entries(childRobots(rootSeo, child)).map(([key, value]) => [
          `robots_${key}`,
          value,
        ]),
      ),
    });
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = await getPropertyBySeoSlug(slug);
  } catch (err) {
    console.error(
      `[generateMetadata] Failed to fetch property for slug "${slug}":`,
      err,
    );
    return {
      title: { absolute: "Majestan Realty" },
      description: "Browse premium properties in India.",
      robots: { index: false, follow: true },
    };
  }

  if (property) {
    const sectionKey = section[0];
    const sectionConfig = SECTION_META[sectionKey];
    if (!sectionConfig || section.length !== 1) {
      return {
        title: { absolute: "Page Not Found | Majestan Realty" },
        robots: { index: false, follow: false },
      };
    }

    const canonicalPath = `/${property.canonicalSlug}/${sectionKey}`;
    const childSeo = getSectionSeo(rootSeo, sectionKey);

    const SEO_KEY_MAP: Record<string, string> = {
      "floor-plan": "floor_plan",
    };
    const seoKey = SEO_KEY_MAP[sectionKey] || sectionKey;
    const seoPage =
      property.seo?.seoData?.[
        seoKey as keyof NonNullable<typeof property.seo>["seoData"]
      ];

    const typeLabel =
      Object.values(PROPERTY_TYPES).find(
        (p) => p.apiValue === property.propertyType,
      )?.label || property.propertyType;

    const fallbackTitle = `${sectionConfig.titlePrefix} - ${property.title} | ${typeLabel} in ${property.city} | Majestan Realty`;
    const suffix =
      sectionKey === "amenities"
        ? (workspaceAmenitySuffix(property.propertyType) ??
          sectionConfig.descriptionSuffix)
        : sectionConfig.descriptionSuffix;
    const fallbackDescription = `${sectionConfig.descriptionPrefix} ${property.title} in ${property.city}. ${suffix}`;

    const legacySectionSeo = seoPage as Record<string, unknown> | undefined;
    const title =
      field(childSeo, "meta_title", "metaTitle", "title") ||
      field(legacySectionSeo || {}, "title") ||
      fallbackTitle;
    const description =
      field(childSeo, "meta_description", "metaDescription", "description") ||
      field(legacySectionSeo || {}, "description") ||
      fallbackDescription;
    const ogTitle = field(legacySectionSeo || {}, "og_title") || title;
    const ogDescription =
      field(legacySectionSeo || {}, "og_description") || description;
    const baseRobots = childRobots(rootSeo, childSeo, seoPage);
    const isIndexableStatus = property.status?.toLowerCase() === "available";
    const robots = {
      index: isIndexableStatus ? baseRobots.index : false,
      follow: baseRobots.follow,
    };

    const ogImage = field(legacySectionSeo || {}, "og_image");
    const ogImages = ogImage
      ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${property.title} - ${sectionConfig.titlePrefix}`,
          },
        ]
      : (property.images || [])
          .filter((image) => image.imageUrl)
          .map((image) => ({
            url: image.imageUrl,
            width: 1200,
            height: 630,
            alt: `${property.title} - ${sectionConfig.titlePrefix}`,
          }))
          .slice(0, 2);

    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: absoluteUrl(
          field(childSeo, "canonical_url", "canonicalUrl", "canonical") ||
            canonicalPath,
        ),
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: absoluteUrl(
          field(childSeo, "canonical_url", "canonicalUrl", "canonical") ||
            canonicalPath,
        ),
        type: "article",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
      },
      robots: {
        ...robots,
        googleBot: {
          index: robots.index,
          follow: robots.follow,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  // Project sub-page metadata (no per-section SEO rows — fallback copy).
  // Checked before static views, mirroring the property branch above.
  try {
    const project = await getProjectBySlugUrl(slug).catch(() => null);
    if (project) {
      const sectionKey = section[0];
      const sectionConfig = PROJECT_SECTION_META[sectionKey];
      if (!sectionConfig || section.length !== 1) {
        return {
          title: { absolute: "Page Not Found | Majestan Realty" },
          robots: { index: false, follow: false },
        };
      }
      const canonicalPath = `/${project.canonicalSlug}/${sectionKey}`;
      const typeLabel = projectTypeLabel(project.projectType);
      const bhkLabel = project.ranges.bhk.length
        ? `${project.ranges.bhk.join(", ")} BHK `
        : "";
      const titlePrefix = projectSectionTitlePrefix(
        sectionKey,
        project.projectType,
      );
      const childSeo = getSectionSeo(rootSeo, sectionKey);
      const title =
        field(childSeo, "meta_title", "metaTitle", "title") ||
        `${titlePrefix} - ${project.name} | ${bhkLabel}${typeLabel} in ${project.city} | Majestan Realty`;
      const description =
        field(childSeo, "meta_description", "metaDescription", "description") ||
        projectSectionDescription(sectionKey, project);
      const canonicalUrl = absoluteUrl(
        field(childSeo, "canonical_url", "canonicalUrl", "canonical") ||
          canonicalPath,
      );
      const ogImage = project.coverImageUrl || undefined;
      return {
        title: { absolute: title },
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
          title,
          description,
          url: canonicalUrl,
          type: "article",
          ...(ogImage
            ? {
                images: [
                  {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${project.name} - ${titlePrefix}`,
                  },
                ],
              }
            : {}),
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          ...(ogImage ? { images: [ogImage] } : {}),
        },
        robots: {
          ...childRobots(rootSeo, childSeo),
          googleBot: {
            ...childRobots(rootSeo, childSeo),
            "max-image-preview": "large",
          },
        },
      };
    }
  } catch {
    /* fall through to views / 404 */
  }

  const pathname = `/${slug}/${section.join("/")}`;
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return { alternates: { canonical: pathname } };
  }

  return {
    title: { absolute: "Page Not Found | Majestan Realty" },
    robots: { index: false, follow: false },
  };
}

/** Renders the section-specific content */
function SectionContent({
  sectionKey,
  property,
}: {
  sectionKey: string;
  property: SeoProperty;
}) {
  switch (sectionKey) {
    case "amenities":
      return <AmenitiesSection property={property} embedded />;
    case "floor-plan":
      return <FloorPlanSection property={property} embedded />;
    case "locality":
      return <LocalitySection property={property} hideContact />;
    case "photos":
      return <PhotosSection property={property} embedded />;
    default:
      return null;
  }
}

/** Renders the project section-specific content */
function ProjectSectionContent({
  sectionKey,
  project,
}: {
  sectionKey: string;
  project: ProjectDetail;
}) {
  switch (sectionKey) {
    case "amenities":
      return <ProjectAmenitiesSection project={project} />;
    case "floor-plans":
      return <ProjectFloorPlanSection project={project} />;
    case "locality":
      return <ProjectLocalitySection project={project} />;
    case "photos":
      return <ProjectPhotosSection project={project} />;
    default:
      return null;
  }
}

export default async function PropertySectionPage({
  params,
}: PropertySectionPageProps): Promise<React.JSX.Element> {
  const { slug, section } = await params;

  if (RESERVED_SECTION_SLUGS.has(slug)) {
    notFound();
  }

  const inventorySeo = await getEffectiveRootSeo(slug);
  if (inventorySeo?.off_market && inventorySeo?.target_snapshot) {
    const allowed =
      inventorySeo.scope === "project" ? PROJECT_SECTION_META : SECTION_META;
    if (section.length !== 1 || !allowed[section[0]]) notFound();
    return <SeoOffMarketPage seo={inventorySeo} section={section[0]} />;
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = await getPropertyBySeoSlug(slug);
  } catch (err) {
    console.error(
      `[PropertySectionPage] Failed to fetch property for slug "${slug}":`,
      err,
    );
    // Rethrow so error.tsx renders with a 5xx status: a 200 "Service
    // Unavailable" page got indexed and shown to visitors whenever the
    // backend was briefly unreachable or rate-limited.
    throw err;
  }

  if (property) {
    const sectionKey = section[0];
    const sectionConfig = SECTION_META[sectionKey];

    if (!sectionConfig || section.length !== 1) {
      notFound();
    }

    if (property.shouldRedirect) {
      permanentRedirect(`/${property.canonicalSlug}/${sectionKey}`);
    }

    const rootSeo = await getEffectiveRootSeo(slug);
    const childSeo = getSectionSeo(rootSeo, sectionKey);
    const sectionH1 =
      field(childSeo, "h1") ||
      (sectionKey === "floor-plan"
        ? `${property.title} 2D Floor Plan & Dimensions`
        : sectionKey === "photos"
          ? `${property.title} Photos`
          : `${property.title} ${sectionConfig.titlePrefix}`);
    const canonicalUrl = absoluteUrl(
      field(childSeo, "canonical_url", "canonicalUrl", "canonical") ||
        `/${property.canonicalSlug}/${sectionKey}`,
    );
    const sectionDescription =
      field(childSeo, "meta_description", "metaDescription", "description") ||
      `${sectionConfig.descriptionPrefix} ${property.title} in ${property.city}. ${sectionConfig.descriptionSuffix}`;

    const breadcrumbItems = buildBreadcrumbItems(property, sectionH1);

    // JSON-LD for this section page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name:
        field(childSeo, "meta_title", "metaTitle", "title") ||
        `${sectionConfig.titlePrefix} - ${property.title}`,
      description: sectionDescription,
      url: canonicalUrl,
      ...(schemaKeywords(rootSeo) ? { keywords: schemaKeywords(rootSeo) } : {}),
      isPartOf: {
        "@type": "WebPage",
        url: absoluteUrl(`/${property.canonicalSlug}`),
        name: property.title,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.majestanrealty.com",
          },
          ...breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: item.label,
            item: item.href ? absoluteUrl(item.href) : canonicalUrl,
          })),
        ],
      },
    };

    // Only FAQs visible on this page are marked up.
    const faqJsonLd = buildFaqPageJsonLd(
      (property.faqs || []).filter((f) => f.section === sectionKey),
      canonicalUrl,
    );

    return (
      <>
        <SiteHeader />
        {/* Spacer matching the fixed header's measured height */}
        <div className="h-[var(--site-header-h)]!" aria-hidden="true" />
        <PropertyNavigation
          slug={property.canonicalSlug}
          activeSection={sectionKey}
        />
        <div className="bg-[#f4f6f9]! min-h-screen! font-manrope-page">
          <main className={`${PAGE_CONTAINER} pt-5! pb-24!`}>
            <Breadcrumbs items={breadcrumbItems} jsonLd={false} />
            <h1 className="mb-5! mt-3! text-2xl! font-semibold! leading-tight! text-gray-900! md:text-3xl!">
              {sectionH1}
            </h1>
            {field(childSeo, "intro_text", "introText") && (
              <TextBlock text={field(childSeo, "intro_text", "introText")!} />
            )}
            <SeoOffMarketBanner seo={rootSeo} />
            <div className={`${OV_ROOT} ${propertyStyles.root}`}>
              <PropertyTopActions property={property} />
              <div className={propertyStyles.columns}>
                <div className={propertyStyles.sectionContent}>
                  <SectionContent sectionKey={sectionKey} property={property} />
                  <FaqSection
                    faqs={(property.faqs || []).filter(
                      (faq) => faq.section === sectionKey,
                    )}
                  />
                  <NeedMoreDetails propertyType={property.propertyType} />
                </div>
                <aside
                  aria-label="Enquire about this property"
                  className={propertyStyles.sectionAside}
                >
                  <PropertyInfoSidebar property={property} headingLevel={2} />
                </aside>
              </div>
            </div>
          </main>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(structuredData),
            }}
          />
          {faqJsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
            />
          )}
        </div>
        <SimilarProperties propertyId={property.id} city={property.city} />
        <SiteFooter />
      </>
    );
  }

  // Project sub-pages — same multi-page shape as properties, for all three
  // project types. Checked before static views (like the property branch)
  // so /{projectSlug}/{section} never falls into the view 404 gate.
  let project: ProjectDetail | null = null;
  try {
    project = await getProjectBySlugUrl(slug).catch(() => null);
  } catch (err) {
    console.error(
      `[ProjectSectionPage] Failed to fetch project for slug "${slug}":`,
      err,
    );
  }
  if (project) {
    const sectionKey = section[0];
    if (!PROJECT_SECTION_META[sectionKey] || section.length !== 1) {
      notFound();
    }
    if (sectionKey === "overview") {
      permanentRedirect(`/${project.canonicalSlug}`);
    }
    const titlePrefix = projectSectionTitlePrefix(
      sectionKey,
      project.projectType,
    );
    const rootSeo = await getEffectiveRootSeo(slug);
    const childSeo = getSectionSeo(rootSeo, sectionKey);
    const sectionH1 =
      field(childSeo, "h1") ||
      (sectionKey === "floor-plans"
        ? `${project.name} Floor Plans & Carpet Area`
        : sectionKey === "photos"
          ? `${project.name} Interior, Exterior & Site Photos`
          : `${project.name} ${projectSectionHeading(sectionKey, project.projectType)}`);
    const sectionDescription =
      field(childSeo, "meta_description", "metaDescription", "description") ||
      projectSectionDescription(sectionKey, project);
    const canonicalUrl = absoluteUrl(
      field(childSeo, "canonical_url", "canonicalUrl", "canonical") ||
        `/${project.canonicalSlug}/${sectionKey}`,
    );
    const breadcrumbItems = [
      { label: "Projects", href: "/projects" },
      { label: project.city, href: "/projects" },
      { label: project.name, href: `/${project.canonicalSlug}` },
      { label: sectionH1 },
    ];
    // Only FAQs filed under this section are shown and marked up.
    const sectionFaqs = projectFaqItems(project).filter(
      (f) => f.section === sectionKey,
    );
    const faqJsonLd = buildFaqPageJsonLd(sectionFaqs, canonicalUrl);
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name:
        field(childSeo, "meta_title", "metaTitle", "title") ||
        `${titlePrefix} - ${project.name}`,
      description: sectionDescription,
      url: canonicalUrl,
      ...(schemaKeywords(rootSeo) ? { keywords: schemaKeywords(rootSeo) } : {}),
      isPartOf: {
        "@type": "WebPage",
        url: absoluteUrl(`/${project.canonicalSlug}`),
        name: project.name,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.majestanrealty.com",
          },
          ...breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: item.label,
            item: item.href ? absoluteUrl(item.href) : canonicalUrl,
          })),
        ],
      },
    };
    return (
      <>
        <SiteHeader />
        <div className="h-[var(--site-header-h)]!" aria-hidden="true" />
        <ProjectNavigation
          slug={project.canonicalSlug}
          activeSection={sectionKey}
          projectType={project.projectType}
        />
        <div
          className={`${OV_ROOT} min-h-screen! bg-[#f4f6f9]! font-manrope-page`}
        >
          <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-3! pb-24!">
            <div className="flex! flex-col! gap-4!">
              <div className="flex! items-center! justify-between! gap-4! min-w-0!">
                <div className="min-w-0! flex-1!">
                  <Breadcrumbs items={breadcrumbItems} jsonLd={false} />
                </div>
                <ProjectTopActions project={project} />
              </div>
              <ProjectSectionTitle title={sectionH1} />
              {field(childSeo, "intro_text", "introText") && (
                <TextBlock text={field(childSeo, "intro_text", "introText")!} />
              )}
              <SeoOffMarketBanner seo={rootSeo} />
              <ProjectShell project={project}>
                <ProjectSectionContent
                  sectionKey={sectionKey}
                  project={project}
                />
                <FaqOverview
                  project={project}
                  section={sectionKey}
                  hideWhenEmpty
                />
                <ProjectHelpSection projectName={project.name} />
              </ProjectShell>
            </div>
          </main>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(structuredData),
          }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(faqJsonLd),
            }}
          />
        )}
        <SimilarProjects projectId={project.id} city={project.city} />
        <SiteFooter />
      </>
    );
  }

  const pathname = `/${slug}/${section.join("/")}`;
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
