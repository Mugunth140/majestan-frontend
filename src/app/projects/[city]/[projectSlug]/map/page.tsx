import { permanentRedirect } from "next/navigation";

export default async function ProjectMapRedirect({
  params,
}: {
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  const { city, projectSlug } = await params;
  permanentRedirect(`/projects/${city}/${projectSlug}#locality`);
}
