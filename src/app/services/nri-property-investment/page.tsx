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

export const metadata: Metadata = buildServiceMetadata(SEO, HERO);

const JSON_LD = buildServiceJsonLd({
  seo: SEO,
  hero: HERO,
  name: "NRI Property Investment Services in Coimbatore",
  serviceType: "Real estate services for Non-Resident Indians",
  faq: FAQ,
  offerCatalog: { name: "NRI services", items: ADVANTAGES.map((a) => a.title) },
});

export default function NriRoute() {
  return (
    <ServicePageShell crumb="NRI Services" jsonLd={JSON_LD}>
      <NriPage />
    </ServicePageShell>
  );
}
