import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";

import { NriPage } from "@/components/site/services/nri/nri-page";
import {
  ADVANTAGES,
  FAQ,
  HERO,
  SEO,
} from "@/components/site/services/nri/content";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  ServicePageShell,
} from "@/components/site/services/shared/service-route";

const defaultMetadata: Metadata = buildServiceMetadata(SEO, HERO);

const JSON_LD = buildServiceJsonLd({
  seo: SEO,
  hero: HERO,
  name: "NRI Property Investment Services in Coimbatore",
  serviceType: "Real estate services for Non-Resident Indians",
  faq: FAQ,
  offerCatalog: { name: "NRI services", items: ADVANTAGES.map((a) => a.title) },
});

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/services/nri-property-investment'),defaultMetadata);}

export default function NriRoute() {
  return (<CoreSeoBoundary path="/services/nri-property-investment">
    <ServicePageShell crumb="NRI Services" jsonLd={JSON_LD}>
      <NriPage />
    </ServicePageShell>
  </CoreSeoBoundary>);
}
