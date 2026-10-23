import type { Metadata } from "next";
import { CoreSeoBoundary } from "@/components/seo/core-seo";
import { getSeo, seoMetadata } from "@/lib/seo-engine";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { LegalPage } from "@/components/site/legal/legal-page";
import { termsIntroduction, termsSections } from "@/components/site/legal/terms-content";

const defaults: Metadata = {
  title: "Terms and conditions",
  description: "Read the terms for using the Majestan Realty website, browsing property listings, making enquiries and submitting a property.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: { title: "Terms and conditions | Majestan Realty", description: "Read the terms for using the Majestan Realty website, browsing property listings, making enquiries and submitting a property.", url: "/terms-and-conditions", type: "website" },
};
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/terms-and-conditions"), defaults);
}
export default function Page() {
  return <CoreSeoBoundary path="/terms-and-conditions"><SiteHeader /><LegalPage kind="terms" introduction={termsIntroduction} sections={termsSections} /><SiteFooter /></CoreSeoBoundary>;
}
