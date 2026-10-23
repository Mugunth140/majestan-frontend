import { generateMetadata as sectionMetadata } from "@/app/[slug]/[...section]/page";
import { notFound, permanentRedirect } from "next/navigation";
import { getProjectBySlugUrl } from "@/lib/api/projects";

export default async function ProjectMapRedirect({
  params,
}: {
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) notFound();
  permanentRedirect((project as any).redirectDestination || `/${project.canonicalSlug}/locality`);
}

export async function generateMetadata({params}: {params: Promise<{city:string;projectSlug:string}>}) {
 const {projectSlug}=await params;
 return sectionMetadata({params:Promise.resolve({slug:projectSlug,section:['locality']})});
}
