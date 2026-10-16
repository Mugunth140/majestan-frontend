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

export const metadata: Metadata = buildServiceMetadata(SEO, HERO);

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

export default function BrokerageRoute() {
  return (
    <ServicePageShell crumb="Brokerage Service" jsonLd={JSON_LD}>
      <BrokeragePage />
    </ServicePageShell>
  );
}
