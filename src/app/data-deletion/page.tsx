import type { Metadata } from "next";
import { CoreSeoBoundary } from "@/components/seo/core-seo";
import { getSeo, seoMetadata } from "@/lib/seo-engine";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { LegalPage } from "@/components/site/legal/legal-page";
import { dataDeletionIntroduction, dataDeletionSections } from "@/components/site/legal/data-deletion-content";

const description = "How to ask Majestan Realty to delete your personal information, including website enquiries and WhatsApp messages.";
const defaults: Metadata = {
  title: "Data deletion",
  description,
  alternates: { canonical: "/data-deletion" },
  openGraph: { title: "Data deletion | Majestan Realty", description, url: "/data-deletion", type: "website" },
};
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/data-deletion"), defaults);
}
export default function Page() {
  return <CoreSeoBoundary path="/data-deletion"><SiteHeader /><LegalPage kind="data-deletion" introduction={dataDeletionIntroduction} sections={dataDeletionSections} /><SiteFooter /></CoreSeoBoundary>;
}
