import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { AmenitiesSection } from "@/components/site/property/sections/AmenitiesSection";
import { FloorPlanSection } from "@/components/site/property/sections/FloorPlanSection";
import { LocalitySection } from "@/components/site/property/sections/LocalitySection";
import { PhotosSection } from "@/components/site/property/sections/PhotosSection";
import { getPropertyBySeoSlug, type SeoProperty } from "@/lib/api/property-by-slug";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import {
  MapPin,
  Phone,
  Calendar,
  Building2,
  Square,
  Clock,
  ShieldCheck,
} from "lucide-react";
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

import { FaqSection } from "@/components/site/property/sections/FaqSection";

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
    
    const sections = ["amenities", "floor-plan", "locality", "photos"];
    const params: { slug: string; section: string[] }[] = [];
    
    for (const slug of slugs) {
      for (const section of sections) {
        params.push({ slug, section: [section] });
      }
    }
    
    return params;
  } catch (error) {
    console.error("Failed to fetch slugs for static generation:", error);
    return [];
  }
}

const RESERVED_SECTION_SLUGS = new Set(["assets"]);

type PropertySectionPageProps = {
  params: Promise<{ slug: string; section: string[] }>;
};

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

const VALID_SECTIONS = new Set(Object.keys(SECTION_META));

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num === 0) return "Price on Request";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2).replace(/\.?0+$/, "")} Lac`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function buildBreadcrumbItems(property: SeoProperty, sectionLabel: string) {
  const isSale = !property.status.toLowerCase().includes("rent");
  const listingType = isSale ? "for-sale" : "for-rent";
  const listingLabel = isSale ? "For Sale" : "For Rent";
  const typeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label || property.propertyType;

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

  if (RESERVED_SECTION_SLUGS.has(slug)) {
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
    const sectionKey = section[0];
    const sectionConfig = SECTION_META[sectionKey];
    if (!sectionConfig || section.length !== 1) {
      return {
        title: "Page Not Found | Majestan Realty",
        robots: { index: false, follow: false },
      };
    }

    const canonicalPath = `/${property.canonicalSlug}/${sectionKey}`;

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
        (p) => p.apiValue === property.propertyType
      )?.label || property.propertyType;

    const fallbackTitle = `${sectionConfig.titlePrefix} - ${property.title} | ${typeLabel} in ${property.city} | Majestan Realty`;
    const fallbackDescription = `${sectionConfig.descriptionPrefix} ${property.title} in ${property.city}. ${sectionConfig.descriptionSuffix}`;

    const title = seoPage?.title || fallbackTitle;
    const description = seoPage?.description || fallbackDescription;
    const ogTitle =
      seoPage?.og_title ||
      `${sectionConfig.titlePrefix} - ${property.title} | Majestan Realty`;
    const ogDescription = seoPage?.og_description || description;
    const robots = parseRobots(seoPage?.robots);

    const ogImages = seoPage?.og_image
      ? [
          {
            url: seoPage.og_image,
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

  const pathname = `/${slug}/${section.join("/")}`;
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return { alternates: { canonical: pathname } };
  }

  return {
    title: "Page Not Found | Majestan Realty",
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
      return <AmenitiesSection property={property} />;
    case "floor-plan":
      return <FloorPlanSection property={property} />;
    case "locality":
      return <LocalitySection property={property} />;
    case "photos":
      return <PhotosSection property={property} />;
    default:
      return null;
  }
}

/** Sidebar with pricing and contact */
function PropertySidebar({ property }: { property: SeoProperty }) {
  const isSale = !property.status.toLowerCase().includes("rent");

  return (
    <div className="sticky! top-[140px]! space-y-6!">
      
      {/* Pricing & Contact Card */}
      <div className="bg-white! rounded-[24px]! p-8! border! border-gray-200! shadow-[0_4px_20px_rgb(0,0,0,0.03)]!">
        <div className="mb-8!">
          <p className="text-gray-500! font-normal! text-sm! tracking-wide! uppercase! mb-2!">
            {isSale ? "Asking Price" : "Monthly Rent"}
          </p>
          <div className="flex! items-baseline! gap-2!">
            <h2 className="text-3xl! font-semibold! text-gray-900! tracking-tight!">
              {formatPrice(property.price)}
            </h2>
            {!isSale && (
              <span className="text-sm! font-light! text-gray-500!">
                / mo
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4!">
          <button className="w-full! bg-gray-900! text-white! font-medium! text-base! py-3.5! rounded-full! hover:bg-gray-800! transition-all! flex! items-center! justify-center! gap-2!">
            <Phone className="w-4.5! h-4.5!" />
            Contact Owner
          </button>

          <button className="w-full! bg-white! text-gray-900! border! border-gray-300! hover:border-gray-900! hover:bg-gray-50! font-medium! text-base! py-3.5! rounded-full! transition-all! flex! items-center! justify-center! gap-2!">
            <Calendar className="w-4.5! h-4.5!" />
            Schedule Visit
          </button>
        </div>
        
        <div className="mt-6! pt-6! border-t! border-gray-100! flex! items-center! justify-center! gap-2! text-sm! font-normal! text-gray-500!">
          <ShieldCheck className="w-4! h-4! text-emerald-500!" />
          {(!property.brokerageType || property.brokerageType === 'no_brokerage')
            ? 'No brokerage for this property'
            : property.brokerageType === 'percentage'
            ? `Brokerage: ${property.brokerageValue}%`
            : `Brokerage: ${property.brokerageValue} Days Rent`}
        </div>
      </div>

      {/* Agent/Owner Info */}
      <div className="bg-white! rounded-[24px]! p-6! border! border-gray-200! flex! items-center! gap-4!">
        <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
          <Building2 className="w-6! h-6! text-gray-600!" />
        </div>
        <div>
          <p className="text-xs! text-gray-500! font-normal! uppercase! tracking-wider! mb-0.5!">
            Listed By
          </p>
          <p className="font-medium! text-base! text-gray-900!">
            Majestan Realty
          </p>
          <p className="text-xs! font-light! text-gray-500! mt-1! flex! items-center! gap-1.5!">
            <ShieldCheck className="w-3.5! h-3.5! text-emerald-500!" />
            Verified Partner
          </p>
        </div>
      </div>
      
    </div>
  );
}

export default async function PropertySectionPage({
  params,
}: PropertySectionPageProps): Promise<React.JSX.Element> {
  const { slug, section } = await params;

  if (RESERVED_SECTION_SLUGS.has(slug)) {
    notFound();
  }

  let property: Awaited<ReturnType<typeof getPropertyBySeoSlug>> = null;

  try {
    property = await getPropertyBySeoSlug(slug);
  } catch (err) {
    console.error(`[PropertySectionPage] Failed to fetch property for slug "${slug}":`, err);
    // Render a friendly error UI directly instead of throwing to prevent Dev Overlay crash
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
    const sectionKey = section[0];
    const sectionConfig = SECTION_META[sectionKey];

    if (!sectionConfig || section.length !== 1) {
      notFound();
    }

    if (property.shouldRedirect) {
      permanentRedirect(`/${property.canonicalSlug}/${sectionKey}`);
    }

    const breadcrumbItems = buildBreadcrumbItems(
      property,
      sectionConfig.titlePrefix
    );

    // JSON-LD for this section page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${sectionConfig.titlePrefix} - ${property.title}`,
      description: `${sectionConfig.descriptionPrefix} ${property.title} in ${property.city}. ${sectionConfig.descriptionSuffix}`,
      url: `https://www.majestanrealty.com/${property.canonicalSlug}/${sectionKey}`,
      isPartOf: {
        "@type": "WebPage",
        url: `https://www.majestanrealty.com/${property.canonicalSlug}`,
        name: property.title,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.majestanrealty.com" },
          ...breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: item.label,
            ...(item.href ? { item: `https://www.majestanrealty.com${item.href}` } : {}),
          })),
        ],
      },
    };

    return (
      <>
        <SiteHeader />
        <div className="pt-[100px]! bg-[#f2f5f9]! min-h-screen!">
          <div className="container! mx-auto! px-4! sm:px-6! py-6! max-w-7xl!">
            <Breadcrumbs items={breadcrumbItems} jsonLd={false} />
            <div className="mb-6!">
              <PropertyNavigation
                slug={property.canonicalSlug}
                activeSection={sectionKey}
              />
            </div>

            <div className="grid! grid-cols-1! lg:grid-cols-3! gap-8! pb-24!">
              {/* Main Content */}
              <div className="lg:col-span-2!">
                <SectionContent
                  sectionKey={sectionKey}
                  property={property}
                />
                
                {/* Per-Section FAQs */}
                {(property.faqs || []).filter(f => f.section === sectionKey).length > 0 && (
                  <div className="mt-8! bg-white! rounded-[24px]! p-8! border! border-gray-200! shadow-sm!">
                    <FaqSection faqs={(property.faqs || []).filter(f => f.section === sectionKey)} />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1!">
                <PropertySidebar property={property} />
              </div>
            </div>
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
