import type { Metadata } from "next";
import { CoreSeoBoundary } from "@/components/seo/core-seo";
import { getSeo, seoMetadata } from "@/lib/seo-engine";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { PrivacyPolicyView } from "@/components/site/views/PrivacyPolicyView";

const defaults: Metadata = {
  title: "Privacy policy",
  description: "Learn how Majestan Realty collects, uses and safeguards your information, and how to contact us about your privacy.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: "Privacy policy | Majestan Realty", description: "Learn how Majestan Realty collects, uses and safeguards your information, and how to contact us about your privacy.", url: "/privacy-policy", type: "website" },
};
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/privacy-policy"), defaults);
}
export default function Page() {
  return <CoreSeoBoundary path="/privacy-policy"><SiteHeader /><PrivacyPolicyView /><SiteFooter /></CoreSeoBoundary>;
}
