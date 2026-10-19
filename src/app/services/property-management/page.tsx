import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";

import { PropertyManagementPage } from "@/components/site/services/property-management/property-management-page";
import {
  FAQ,
  HERO,
  SEO,
  SERVICES,
} from "@/components/site/services/property-management/content";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  ServicePageShell,
} from "@/components/site/services/shared/service-route";

const defaultMetadata: Metadata = buildServiceMetadata(SEO, HERO);

const JSON_LD = buildServiceJsonLd({
  seo: SEO,
  hero: HERO,
  name: "Property Management Services in Coimbatore",
  serviceType: "Property management for NRIs and property owners",
  faq: FAQ,
  offerCatalog: {
    name: "Property management services",
    items: SERVICES.map((s) => s.title),
  },
});

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/services/property-management'),defaultMetadata);}

export default function PropertyManagementRoute() {
  return (<CoreSeoBoundary path="/services/property-management">
    <ServicePageShell crumb="Property Management" jsonLd={JSON_LD}>
      <PropertyManagementPage />
    </ServicePageShell>
  </CoreSeoBoundary>);
}
