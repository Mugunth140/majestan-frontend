import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import type { FaqContent, ServiceHeroContent, ServiceSeo } from "./types";

const SITE_URL = "https://www.majestanrealty.com";

/**
 * Same metadata shape as /services/liaisoning. The title is `absolute` because
 * layout.tsx appends "| Majestan Realty" and these titles already carry it.
 */
export function buildServiceMetadata(
  seo: ServiceSeo,
  hero: ServiceHeroContent,
): Metadata {
  const url = `${SITE_URL}${seo.canonical}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: [...seo.keywords],
    alternates: { canonical: seo.canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: "Majestan Realty",
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: hero.image,
          width: hero.imageWidth,
          height: hero.imageHeight,
          alt: hero.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [hero.image],
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

/** Service + FAQPage graph; `extra` adds page-specific nodes (offer catalogues, lists). */
export function buildServiceJsonLd({
  seo,
  hero,
  name,
  serviceType,
  faq,
  offerCatalog,
  extra = [],
}: {
  seo: ServiceSeo;
  hero: ServiceHeroContent;
  name: string;
  serviceType: string;
  faq: FaqContent;
  offerCatalog?: { name: string; items: readonly string[] };
  extra?: unknown[];
}): unknown {
  const url = `${SITE_URL}${seo.canonical}`;
  const service = {
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description: seo.description,
    serviceType,
    url,
    image: `${SITE_URL}${hero.image}`,
    areaServed: [
      { "@type": "City", name: "Coimbatore" },
      { "@type": "State", name: "Tamil Nadu" },
    ],
    provider: { "@id": `${SITE_URL}#organization` },
    ...(offerCatalog && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: offerCatalog.name,
        itemListElement: offerCatalog.items.map((item) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: item },
        })),
      },
    }),
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [service, ...extra, faqPage],
  };
}

/** Header, breadcrumbs, page background and footer shared by every service page. */
export function ServicePageShell({
  crumb,
  jsonLd,
  children,
}: {
  crumb: string;
  jsonLd: unknown;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="font-manrope-page pt-[var(--site-header-h)]! bg-[#f2f5f9]!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-6!">
          <Breadcrumbs
            items={[
              { label: "Services", href: "/#services" },
              { label: crumb },
            ]}
          />
        </div>
        {children}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
