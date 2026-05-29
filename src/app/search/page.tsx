import type { Metadata } from "next";
import { SearchResults } from "@/components/site/home/search-results";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";

export const metadata: Metadata = {
  title: "Search Properties | Majestan Realty",
  description:
    "Search and discover apartments, villas, plots, commercial spaces, and more in Coimbatore. Find your dream property with Majestan Realty.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <SearchResults />
      <SiteFooter />
    </>
  );
}
