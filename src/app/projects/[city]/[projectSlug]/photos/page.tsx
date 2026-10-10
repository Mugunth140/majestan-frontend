import { notFound, permanentRedirect } from "next/navigation";
import { getProjectBySlugUrl } from "@/lib/api/projects";

export default async function ProjectPhotosRedirect({
  params,
}: {
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) notFound();
  permanentRedirect(`/${project.canonicalSlug}/photos`);
}
