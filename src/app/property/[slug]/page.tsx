import { SitePage } from "@/components/site/layout/site-page";
import { resolveViewForPath } from "@/lib/site/route-resolver";
import { notFound, permanentRedirect } from "next/navigation";

export default async function LegacyPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;

  if (/-[a-z]{1,6}\d+$/i.test(slug)) {
    permanentRedirect(`/${slug}`);
  }

  const viewName = resolveViewForPath(`/property/${slug}`);
  if (!viewName) {
    notFound();
  }

  return <SitePage viewName={viewName} />;
}
