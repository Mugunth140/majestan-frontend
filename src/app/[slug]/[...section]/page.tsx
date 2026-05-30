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

export const dynamic = "force-dynamic";

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
  } catch {
    property = null;
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
    const description = `${sectionConfig.descriptionPrefix} ${property.title} in ${property.city}. ${sectionConfig.descriptionSuffix}`;
    const typeLabel =
      Object.values(PROPERTY_TYPES).find(
        (p) => p.apiValue === property.propertyType
      )?.label || property.propertyType;

    return {
      title: `${sectionConfig.titlePrefix} - ${property.title} | ${typeLabel} in ${property.city} | Majestan Realty`,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `${sectionConfig.titlePrefix} - ${property.title} | Majestan Realty`,
        description,
        url: canonicalPath,
        type: "article",
        images: property.images
          .filter((image) => image.imageUrl)
          .map((image) => ({
            url: image.imageUrl,
            width: 1200,
            height: 630,
            alt: `${property.title} - ${sectionConfig.titlePrefix}`,
          }))
          .slice(0, 2),
      },
      twitter: {
        card: "summary_large_image",
        title: `${sectionConfig.titlePrefix} - ${property.title} | Majestan Realty`,
        description,
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
    <div className="sticky top-[140px] space-y-6">
      {/* Pricing Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="mb-5">
          <p className="text-gray-400 font-medium text-sm mb-1">
            {isSale ? "Asking Price" : "Monthly Rent"}
          </p>
          <div className="flex items-end gap-2">
            <h2 className="font-['Lexend',sans-serif] text-3xl font-extrabold text-[#27427f]">
              {formatPrice(property.price)}
            </h2>
            {!isSale && (
              <span className="text-sm text-gray-400 mb-1">/ month</span>
            )}
          </div>
          {isSale &&
            property.details?.areaSqft &&
            !isNaN(parseFloat(property.price)) && (
              <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1">
                <Square className="w-3.5 h-3.5" />₹{" "}
                {Math.round(
                  parseFloat(property.price) /
                    parseFloat(property.details.areaSqft)
                ).toLocaleString("en-IN")}{" "}
                / sq.ft
              </p>
            )}
        </div>

        <button className="w-full bg-[#ffc900] hover:bg-[#f0bd00] text-[#161e2d] font-bold text-base py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(255,201,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,201,0,0.5)] mb-3 flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          Contact Owner
        </button>

        <button className="w-full bg-white hover:bg-gray-50 text-[#27427f] border-2 border-[#27427f]/10 hover:border-[#27427f]/30 font-bold text-base py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule a Visit
        </button>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#27427f]/10 to-[#27427f]/5 border border-gray-200 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#27427f]/40" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Listed By
            </p>
            <p className="font-bold text-[#161e2d] text-sm">Majestan Realty</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Since {new Date(property.createdAt).getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Badge */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">
              Verified Listing
            </p>
            <p className="text-[11px] text-green-600 mt-0.5">
              Verified by Majestan Realty
            </p>
          </div>
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
  } catch {
    property = null;
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
        <div className="pt-[120px]! bg-[#f8f9fa]! min-h-screen!">
          <div className="container! mx-auto! px-4! max-w-7xl! pt-4!">
            <Breadcrumbs items={breadcrumbItems} jsonLd={false} />
            <div className="mb-6!">
              <PropertyNavigation
                slug={property.canonicalSlug}
                activeSection={sectionKey}
              />
            </div>
          </div>

          <div className="container! mx-auto! px-4! max-w-7xl! pb-20!">
            <div className="grid! grid-cols-1! lg:grid-cols-3! gap-8!">
              {/* Main Content */}
              <div className="lg:col-span-2!">
                <SectionContent
                  sectionKey={sectionKey}
                  property={property}
                />
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
