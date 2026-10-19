import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";

import { BrokeragePage } from "@/components/site/services/brokerage/brokerage-page";
import {
  FAQ,
  HERO,
  SEGMENTS,
  SEO,
} from "@/components/site/services/brokerage/content";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  ServicePageShell,
} from "@/components/site/services/shared/service-route";

const defaultMetadata: Metadata = buildServiceMetadata(SEO, HERO);

const JSON_LD = buildServiceJsonLd({
  seo: SEO,
  hero: HERO,
  name: "Real Estate Brokerage Services in Coimbatore",
  serviceType: "Real estate brokerage: sales, purchases and leasing",
  faq: FAQ,
  offerCatalog: {
    name: "Brokerage transactions",
    items: SEGMENTS.flatMap((segment) =>
      segment.items.map((item) => item.label),
    ),
  },
});

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/services/professional-brokerage-services'),defaultMetadata);}

export default function BrokerageRoute() {
  return (<CoreSeoBoundary path="/services/professional-brokerage-services">
    <ServicePageShell crumb="Brokerage Service" jsonLd={JSON_LD}>
      <BrokeragePage />
    </ServicePageShell>
  </CoreSeoBoundary>);
}
