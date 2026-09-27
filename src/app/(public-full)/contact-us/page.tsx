import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { ContactHero } from "@/components/site/contact/ContactHero";
import { ContactDetails } from "@/components/site/contact/ContactDetails";
import { ContactEnquiryForm } from "@/components/site/contact/ContactEnquiryForm";
import { ContactMap } from "@/components/site/contact/ContactMap";
import { ContactFaq } from "@/components/site/contact/ContactFaq";
import { CONTACT_SEO, DETAILS, INTRO_DESCRIPTION } from "@/components/site/contact/content";
import { Reveal } from "@/components/site/shared/reveal";

const CANONICAL_URL = `https://www.majestanrealty.com${CONTACT_SEO.canonical}`;

/**
 * The page previously exported no metadata at all, so it was serving the
 * site-wide default title and description on the one URL whose entire job is
 * converting. `absolute` because layout.tsx sets a "%s | Majestan Realty"
 * template that would otherwise be appended to a title that already ends in the
 * brand.
 */
export const metadata: Metadata = {
  title: { absolute: CONTACT_SEO.title },
  description: CONTACT_SEO.description,
  alternates: { canonical: CONTACT_SEO.canonical },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: CANONICAL_URL,
    siteName: "Majestan Realty",
    title: CONTACT_SEO.title,
    description: CONTACT_SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_SEO.title,
    description: CONTACT_SEO.description,
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

const BREADCRUMBS = [{ label: "Contact Us" }];

/**
 * LocalBusiness so the address, phone and opening hours are machine-readable.
 * The hours deliberately match the "Sunday closed except scheduled viewings"
 * copy on the page — publishing Mo-Sa 09:00-18:00 rather than inventing a Sunday
 * slot, since the page itself does not promise one.
 */
function buildStructuredData(): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${CANONICAL_URL}#office`,
    name: "Majestan Realty",
    url: CANONICAL_URL,
    telephone: "+91 90929 65556",
    email: DETAILS.email.value,
    parentOrganization: { "@id": "https://www.majestanrealty.com#organization" },
    address: {
      "@type": "PostalAddress",
      streetAddress: DETAILS.streetAddress,
      addressLocality: DETAILS.addressLocality,
      addressRegion: DETAILS.addressRegion,
      postalCode: DETAILS.postalCode,
      addressCountry: DETAILS.addressCountry,
    },
    areaServed: { "@type": "City", name: DETAILS.addressLocality },
    openingHours: [...DETAILS.openingHours],
  };
}

export default function ContactUsPage() {
  return (
    /*
      No SiteHeader/SiteFooter here: app/(public-full)/layout.tsx already renders
      both, and importing them again produced two of each on the page.

      The layout also deliberately adds no top padding ("so hero sections start at
      the absolute top"), which leaves fixed-header content underneath it — so the
      offset is applied on <main> with the measured --site-header-h instead.
    */
    <main className="font-manrope-page pt-[var(--site-header-h)]! bg-[#f2f5f9]!">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-6!">
        <Breadcrumbs items={BREADCRUMBS} />
      </div>

      <ContactHero />

      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        {/* The INTRO copy stands alone here rather than under its own heading:
            the H1 directly above already says "Let's Get in Touch", and a second
            "Get in touch" heading immediately beneath it read as a mistake. */}
        <Reveal>
          <p className="mt-[34px]! max-w-[54ch]! text-[15px]! md:text-[16px]! leading-[1.65]! text-gray-600!">
            {INTRO_DESCRIPTION}
          </p>
        </Reveal>

        {/* Details and form side by side, divided by a single vertical rule
            rather than each sitting in its own card. */}
        <div className="mt-[30px]! grid! grid-cols-1! lg:grid-cols-2! gap-10! lg:gap-16! pb-[56px]! md:pb-[72px]! items-start!">
          <ContactDetails />
          <div className="lg:border-l! lg:border-gray-200! lg:pl-16!">
            <ContactEnquiryForm />
          </div>
        </div>
      </div>

      <div className="bg-white! border-y! border-gray-200!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! py-[52px]! md:py-[64px]!">
          <Reveal>
            <ContactMap />
          </Reveal>
        </div>
      </div>

      <ContactFaq />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
      />
    </main>
  );
}
