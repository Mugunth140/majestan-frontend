import { blogFetch, type Post } from '@/lib/blog';
import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";
import { HomePage } from "@/components/site/home/home-page";
import { getHomePageData, type HomePageData } from "@/lib/api";
import { getAdsBanners } from "@/lib/ads";

const defaultMetadata: Metadata = {
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
  handpickedProperties: [],
  featuredProjects: [],
  googleReviews: null,
};

// ISR: the homepage is served from cache and rebuilt in the background at most
// once a minute (and on demand: the CRM's /api/revalidate calls revalidatePath("/")
// on every listing change). Rendering it per request cost ~1 s of TTFB (LCP).
export const revalidate = 60;

// The build has no API access, so it prerenders the empty fallback (replaced
// within a minute). At runtime a failed /home fetch throws instead, which keeps
// the last good page in the cache rather than caching an empty homepage.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/'),defaultMetadata);}

export default async function Page() {
  let homeData = emptyHomeData;

  try {
    homeData = await getHomePageData();
  } catch (error) {
    if (!isBuild) throw error;
    homeData = emptyHomeData;
  }

  const [banners, offers, articles] = await Promise.all([
    getAdsBanners("hero").catch(() => []),
    getAdsBanners("offers").catch(() => []),
    blogFetch<{items: Post[]}>("?limit=8", 300).then(result => result.items).catch(() => []),
  ]);

  return <CoreSeoBoundary path="/"><HomePage data={homeData} banners={banners} offers={offers} articles={articles} /></CoreSeoBoundary>;
}
