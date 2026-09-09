import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { ProjectsListingShell } from "@/components/projects/ProjectsListingShell";

export const metadata: Metadata = {
  title: "New Villa & Apartment Projects | Majestan Realty",
  description:
    "Explore new villa and apartment projects with price ranges, BHK configurations, floor plans and RERA details. Find your dream home with Majestan Realty.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndexPage() {
  return (
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      <Suspense>
        <ProjectsListingShell />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
