import { notFound } from "next/navigation";
import { fetchProjectListing, projectFilters } from "@/lib/project-listing-data";
import { listingPageNumber, listingMetadata } from "@/lib/seo-pagination";
export const dynamic = "force-dynamic";
import { getSeo } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { ProjectsListingShell } from "@/components/projects/ProjectsListingShell";

const defaultMetadata: Metadata = {
  title: "New Villa & Apartment Projects | Majestan Realty",
  description:
    "Explore new villa and apartment projects with price ranges, BHK configurations, floor plans and RERA details. Find your dream home with Majestan Realty.",
  alternates: { canonical: "/projects" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props) {
  const seo = await getSeo('/projects');
  const page = listingPageNumber((await searchParams).page);
  return listingMetadata({ path: '/projects', canonical_type: 'self', meta_description: defaultMetadata.description, meta_title: 'New Projects in Coimbatore | Majestan Realty', ...seo }, page);
}

export default async function ProjectsIndexPage({ searchParams }: Props) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  const filters = projectFilters(params, 'Coimbatore');
  const page = listingPageNumber(query.page);
  // Errors propagate as a service failure rather than rendering a false zero-stock page.
  const initialData = await fetchProjectListing('Coimbatore', filters, params.get('sort') || '', page);
  if (page > Math.max(1, Math.ceil(initialData.total / initialData.limit))) notFound();
  return (<CoreSeoBoundary path="/projects">
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      <Suspense>
        <ProjectsListingShell initialData={initialData} initialFilters={filters} />
      </Suspense>
      <SiteFooter />
    </div>
  </CoreSeoBoundary>);
}
