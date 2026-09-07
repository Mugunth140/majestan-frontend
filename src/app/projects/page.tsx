import type { Metadata } from "next";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";

export const metadata: Metadata = {
  title: "New Villa & Apartment Projects | Majestan Realty",
  description:
    "Explore new villa and apartment projects with price ranges, BHK configurations, floor plans and RERA details. Find your dream home with Majestan Realty.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndexPage() {
  return <ProjectsExplorer />;
}
