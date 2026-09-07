import { permanentRedirect } from "next/navigation";

export default async function ProjectPhotosRedirect({
  params,
}: {
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  const { city, projectSlug } = await params;
  permanentRedirect(`/projects/${city}/${projectSlug}#photos`);
}
