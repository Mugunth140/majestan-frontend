import { SitePage } from "@/components/site/layout/site-page";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { getPropertyBySeoSlug } from "@/lib/api/property-by-slug";
import { resolveViewForPath } from "@/lib/site/route-resolver";
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

const buildPropertyDescription = (description: string, city: string): string => {
  const trimmed = description.trim();
  if (trimmed.length > 0) {
    return trimmed.slice(0, 160);
  }

  return `Explore this property listing in ${city}.`;
};

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
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
    const canonicalPath = `/${property.canonicalSlug}`;
    const description = buildPropertyDescription(property.description, property.city);

    return {
      title: `${property.title} | Majestan Realty`,
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
          .map((image) => image.imageUrl)
          .slice(0, 3),
      },
    };
  }

  const pathname = `/${slug}`;
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

export default async function SlugPage({ params }: SlugPageProps): Promise<React.JSX.Element> {
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

    const canonicalPath = `/${property.canonicalSlug}`;
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.title,
      description: buildPropertyDescription(property.description, property.city),
      url: canonicalPath,
      image: property.images.map((image) => image.imageUrl),
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
        addressCountry: property.country,
      },
    };

    return (
      <>
        <SiteHeader />
        <div className="pt-28!">
          <div className="container mx-auto px-4 py-8">
            <PropertyNavigation slug={property.canonicalSlug} />
            <main className="space-y-6">
              <h1 className="text-4xl font-bold">{property.title}</h1>
              <p className="text-lg text-gray-600">{buildPropertyDescription(property.description, property.city)}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-xl font-semibold">₹ {property.price}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-xl font-semibold capitalize">{property.propertyType}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-xl font-semibold capitalize">{property.status}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-xl font-semibold">{property.city}</p>
                </div>
              </div>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
              />
            </main>
          </div>
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
      <div className="pt-28!">
        <SitePage viewName={viewName} />
      </div>
      <SiteFooter />
    </>
  );
}

