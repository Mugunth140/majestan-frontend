import type { Metadata } from "next";

import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { LiaisoningPage } from "@/components/site/services/liaisoning/liaisoning-page";
import {
  CATEGORIES,
  FAQ,
  GENERAL_LIAISONING,
  HERO,
  LIAISONING_SEO,
} from "@/components/site/services/liaisoning/content";

const CANONICAL_URL = `https://www.majestanrealty.com${LIAISONING_SEO.canonical}`;

/**
 * A static export, not generateMetadata: the page has no dynamic data, so the
 * resolved tags land in the initial HTML instead of streaming in.
 *
 * The title is `absolute` on purpose. layout.tsx sets `title.template =
 * "%s | Majestan Realty"`, and the legacy title already ends in the brand — a
 * plain string would render "… | Majestan Realty | Majestan Realty".
 *
 * description/keywords are restored verbatim from the original CodeIgniter
 * controller (Services::liaisoning), which the port to Next.js dropped.
 */
export const metadata: Metadata = {
  title: { absolute: LIAISONING_SEO.title },
  description: LIAISONING_SEO.description,
  keywords: [...LIAISONING_SEO.keywords],
  alternates: { canonical: LIAISONING_SEO.canonical },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: CANONICAL_URL,
    siteName: "Majestan Realty",
    title: LIAISONING_SEO.title,
    description: LIAISONING_SEO.description,
    images: [
      {
        url: HERO.image,
        width: 722,
        height: 482,
        alt: HERO.imageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: LIAISONING_SEO.title,
    description: LIAISONING_SEO.description,
    images: [HERO.image],
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

const BREADCRUMBS = [
  { label: "Services", href: "/#services" },
  { label: "Liaisoning" },
];

/**
 * Service + FAQPage. The offer catalogue reuses the three tab groups as
 * hasOfferCatalog.itemListElement so the nineteen covered asset classes are
 * machine-readable rather than trapped in a carousel.
 */
function buildStructuredData(): unknown {
  const service = {
    "@type": "Service",
    "@id": `${CANONICAL_URL}#service`,
    name: "Liaisoning Services in Coimbatore",
    alternateName: "Property Liaisoning and Approvals",
    description: LIAISONING_SEO.description,
    serviceType: "Real estate liaisoning, approvals and regulatory compliance",
    url: CANONICAL_URL,
    image: `https://www.majestanrealty.com${HERO.image}`,
    areaServed: [
      { "@type": "City", name: "Coimbatore" },
      { "@type": "State", name: "Tamil Nadu" },
    ],
    provider: { "@id": "https://www.majestanrealty.com#organization" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Liaisoning coverage by asset class",
      itemListElement: CATEGORIES.map((category) => ({
        "@type": "OfferCatalog",
        name: category.label,
        itemListElement: category.items.map((item) => ({
          "@type": "Service",
          name: item.label,
        })),
      })),
    },
  };

  /**
   * The authority -> purpose mapping is the most useful thing on this page for a
   * machine reader, so it gets its own ItemList rather than being buried in a
   * property of the Service node.
   */
  const authorities = {
    "@type": "ItemList",
    "@id": `${CANONICAL_URL}#authorities`,
    name: "Approvals covered by Majestan Realty liaisoning",
    itemListElement: GENERAL_LIAISONING.rows.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: row.aspect,
      description: row.purpose,
      item: {
        "@type": "GovernmentOrganization",
        name: row.authority,
      },
    })),
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${CANONICAL_URL}#faq`,
    mainEntity: FAQ.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return { "@context": "https://schema.org", "@graph": [service, authorities, faq] };
}

export default function LiaisoningRoute() {
  return (
    <>
      <SiteHeader />
      <main className="font-manrope-page pt-[var(--site-header-h)]! bg-[#f2f5f9]!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-6!">
          <Breadcrumbs items={BREADCRUMBS} />
        </div>
        <LiaisoningPage />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
      />
    </>
  );
}
