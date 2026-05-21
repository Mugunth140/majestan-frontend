import { permanentRedirect } from "next/navigation";

export default async function LegacyPropertyVideosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<never> {
  const { slug } = await params;
  permanentRedirect(`/${slug}/videos`);
}
