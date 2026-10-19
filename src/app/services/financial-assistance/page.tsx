import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";

import { FinancialAssistancePage } from "@/components/site/services/financial-assistance/financial-assistance-page";
import {
  BANK_PARTNERS,
  FAQ,
  HERO,
  HIGHLIGHTS,
  SEO,
} from "@/components/site/services/financial-assistance/content";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  ServicePageShell,
} from "@/components/site/services/shared/service-route";

const defaultMetadata: Metadata = buildServiceMetadata(SEO, HERO);

const PAGE_URL = `https://www.majestanrealty.com${SEO.canonical}`;

const JSON_LD = buildServiceJsonLd({
  seo: SEO,
  hero: HERO,
  name: "Home Loan and Financial Assistance in Coimbatore",
  serviceType: "Home loan assistance and property financing",
  faq: FAQ,
  offerCatalog: {
    name: "Loan assistance",
    items: HIGHLIGHTS.map((h) => h.title),
  },
  extra: [
    {
      "@type": "ItemList",
      "@id": `${PAGE_URL}#lenders`,
      name: "Majestan Realty banking partners",
      itemListElement: BANK_PARTNERS.map((bank, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@type": "FinancialService", name: bank.name },
      })),
    },
  ],
});

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/services/financial-assistance'),defaultMetadata);}

export default function FinancialAssistanceRoute() {
  return (<CoreSeoBoundary path="/services/financial-assistance">
    <ServicePageShell crumb="Financial Assistance" jsonLd={JSON_LD}>
      <FinancialAssistancePage />
    </ServicePageShell>
  </CoreSeoBoundary>);
}
