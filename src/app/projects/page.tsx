import { getSeo,seoMetadata } from '@/lib/seo-engine';
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

export async function generateMetadata(){return seoMetadata(await getSeo('/projects'),defaultMetadata);}

export default function ProjectsIndexPage() {
  return (<CoreSeoBoundary path="/projects">
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      <Suspense>
        <ProjectsListingShell />
      </Suspense>
      <SiteFooter />
    </div>
  </CoreSeoBoundary>);
}
