import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { ContactHero } from "@/components/site/contact/ContactHero";
import { ContactEnquiryForm } from "@/components/site/contact/ContactEnquiryForm";
import { ContactVisit } from "@/components/site/contact/ContactVisit";
import { ContactFaq } from "@/components/site/contact/ContactFaq";
import { CONTACT_SEO, DETAILS } from "@/components/site/contact/content";

const CANONICAL_URL = `https://www.majestanrealty.com${CONTACT_SEO.canonical}`;

/**
 * The page previously exported no metadata at all, so it was serving the
 * site-wide default title and description on the one URL whose entire job is
 * converting. `absolute` because layout.tsx sets a "%s | Majestan Realty"
 * template that would otherwise be appended to a title that already ends in the
 * brand.
 */
const defaultMetadata: Metadata = {
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

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/contact-us'),defaultMetadata);}

export default function ContactUsPage() {
  return (<CoreSeoBoundary path="/contact-us">
    {/*
      No SiteHeader/SiteFooter here: app/(public-full)/layout.tsx already renders
      both, and importing them again produced two of each on the page.

      The layout also deliberately adds no top padding ("so hero sections start at
      the absolute top"), which leaves fixed-header content underneath it — so the
      offset is applied on <main> with the measured --site-header-h instead.
    */}
    <main className="font-manrope-page pt-[var(--site-header-h)]! pb-20! md:pb-28! bg-[#f4f6f9]!">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="pt-6!">
          <Breadcrumbs items={BREADCRUMBS} />
        </div>

        {/* First screen: every way to reach the office on the left, the
            message form on the right, so nothing important is below the fold. */}
        <section
          aria-labelledby="contact-hero-heading"
          className="mt-8! grid! grid-cols-1! gap-10! md:mt-12! lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]! lg:gap-16! lg:items-start!"
        >
          <ContactHero />
          <div className="rounded-3xl! border! border-[#dfe7f4]! bg-[linear-gradient(160deg,#fff_0%,#fff_55%,#edf4ff_100%)]! p-6! shadow-[0_1px_2px_rgba(10,15,28,0.04),0_30px_60px_-36px_rgba(22,69,191,0.35)]! sm:p-8!">
            <ContactEnquiryForm />
          </div>
        </section>

        <ContactVisit />
        <ContactFaq />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
      />
    </main>
  </CoreSeoBoundary>);
}
