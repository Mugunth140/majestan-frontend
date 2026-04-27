import type { Metadata } from "next";
import { HomePage } from "@/components/site/home/home-page";
import { getHomePageData, type HomePageData } from "@/lib/api";

export const metadata: Metadata = {
  title: "Majestan Realty | Real Estate Experts in Coimbatore",
  description:
    "Looking for the top realtor in Coimbatore? Majestan Realty offers trusted real estate services in villas, plots, apartments and commercial properties.",
  alternates: {
    canonical: "/",
  },
};

const emptyHomeData: HomePageData = {
  filters: {
    sublocations: [],
    unitTypes: [],
  },
  banners: [],
  featuredApartments: [],
  featuredVillas: [],
};

export default async function Page() {
  let homeData = emptyHomeData;

  try {
    homeData = await getHomePageData();
  } catch {
    homeData = emptyHomeData;
  }

  return <HomePage data={homeData} />;
}
