import { getSeo, seoMetadata } from "@/lib/seo-engine";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getProjectBySlugUrl,
  formatINR,
} from "@/lib/api/projects";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams(): Promise<{ city: string; projectSlug: string }[]> {
  // No build-time prerender (see [slug]/page.tsx): every project page
  // renders on demand and ISR-caches per `revalidate`.
  return [];
}

type PageProps = {
  params: Promise<{ city: string; projectSlug: string }>;
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").trim().slice(0, 160);

function parseRobots(robotsStr?: string): { index: boolean; follow: boolean } {
  if (!robotsStr) return { index: true, follow: true };
  const [indexPart, followPart] = robotsStr.split(",");
  return {
    index: indexPart?.trim() === "index",
    follow: followPart?.trim() === "follow",
  };
}

async function legacyMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) return { title: "Not Found | Majestan Realty", robots: { index: false, follow: false } };

  const canonicalPath = `/${project.canonicalSlug}`;
  const seo = project.seo?.seoData?.overview;
  const typeLabel = project.projectType === "villa" ? "Villa" : project.projectType === "plot" ? "Plot" : "Apartment";
  const bhkLabel = project.ranges.bhk.length ? `${project.ranges.bhk.join(", ")} BHK ` : "";
  const priceLabel =
    project.ranges.minPrice != null
      ? ` ${formatINR(project.ranges.minPrice)}${project.ranges.maxPrice && project.ranges.maxPrice !== project.ranges.minPrice ? ` - ${formatINR(project.ranges.maxPrice)}` : ""}`
      : "";

  const title = seo?.title || `${project.name} - ${bhkLabel}${typeLabel} in ${project.city} | Majestan Realty`;
  const description =
    seo?.description ||
    (project.description
      ? stripHtml(project.description)
      : `${project.name}, ${bhkLabel}${typeLabel.toLowerCase()} project in ${project.city}.${priceLabel ? ` Price${priceLabel}.` : ""} View configurations, floor plans, photos and locality details.`);
  const robots = parseRobots(seo?.robots);
  const ogImage = seo?.og_image || project.coverImageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: canonicalPath,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      ...robots,
      googleBot: { index: robots.index ?? true, follow: robots.follow ?? true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function ProjectOverviewPage({ params }: PageProps) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) notFound();
  permanentRedirect((project as any).redirectDestination || `/${project.canonicalSlug}`);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
 const {projectSlug}=await props.params;
 return seoMetadata(await getSeo('/'+projectSlug), await legacyMetadata(props));
}
