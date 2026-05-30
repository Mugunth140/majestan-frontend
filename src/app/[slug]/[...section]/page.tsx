import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { getPropertyBySeoSlug } from "@/lib/api/property-by-slug";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import Link from "next/link";
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
  }
> = {
  amenities: {
    titlePrefix: "Amenities",
    descriptionPrefix: "Amenities and facilities for",
  },
  locality: {
    titlePrefix: "Locality",
    descriptionPrefix: "Locality insights for",
  },
  "floor-plan": {
    titlePrefix: "Floor Plan",
    descriptionPrefix: "Floor plans and layout details for",
  },
  photos: {
    titlePrefix: "Photos",
    descriptionPrefix: "Photo gallery for",
  },
  videos: {
    titlePrefix: "Videos",
    descriptionPrefix: "Video walkthroughs for",
  },
  price: {
    titlePrefix: "Pricing",
    descriptionPrefix: "Pricing details for",
  },
  specifications: {
    titlePrefix: "Specifications",
    descriptionPrefix: "Technical specifications for",
  },
};

const buildSectionPath = (slug: string, sectionParts: string[]): string =>
  `/${slug}/${sectionParts.join("/")}`;

export async function generateMetadata({
  params,
}: PropertySectionPageProps): Promise<Metadata> {
  const { slug, section } = await params;

  if (RESERVED_SECTION_SLUGS.has(slug)) {
    return {
      title: "Page Not Found | Majestan Realty",
      robots: {
        index: false,
        follow: false,
      },
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
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const canonicalPath = `/${property.canonicalSlug}/${sectionKey}`;
    const description = `${sectionConfig.descriptionPrefix} ${property.title}.`;

    return {
      title: `${sectionConfig.titlePrefix} - ${property.title} | Majestan Realty`,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `${sectionConfig.titlePrefix} - ${property.title} | Majestan Realty`,
        description,
        url: canonicalPath,
        type: "article",
      },
    };
  }

  const pathname = buildSectionPath(slug, section);
  const viewName = resolveViewForPath(pathname);
  if (viewName) {
    return {
      alternates: {
        canonical: pathname,
      },
    };
  }

  return {
    title: "Page Not Found | Majestan Realty",
    robots: {
      index: false,
      follow: false,
    },
  };
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

    return (
      <>
        <SiteHeader />
        <div className="pt-28!">
          <div className="container mx-auto px-4 py-8">
            <PropertyNavigation slug={property.canonicalSlug} />
            <main className="space-y-6">
              <h1 className="text-4xl font-bold">
                {sectionConfig.titlePrefix} - {property.title}
              </h1>
              <p className="text-lg text-gray-600">
                {sectionConfig.descriptionPrefix} <strong>{property.title}</strong>.
              </p>
              <div className="mt-8 border-t border-gray-200 pt-8">
                <Link
                  href={`/${property.canonicalSlug}`}
                  className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  View Full Property
                </Link>
              </div>
            </main>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  const pathname = buildSectionPath(slug, section);
  const viewName = resolveViewForPath(pathname);
  if (!viewName) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <div className="pt-28!">
        <SitePage viewName={viewName} />
      </div>
      <SiteFooter />
    </>
  );
}
