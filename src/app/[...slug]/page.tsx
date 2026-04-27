import { notFound } from "next/navigation";
import { SitePage } from "@/components/site/layout/site-page";
import { resolveViewForPath } from "@/lib/site/route-resolver";

export const dynamic = "force-dynamic";

type CatchAllParams = {
  slug?: string[];
};

type CatchAllPageProps = {
  params: CatchAllParams | Promise<CatchAllParams>;
};

export default async function CatchAllPage({
  params,
}: CatchAllPageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? [];
  const pathname = slug.length > 0 ? `/${slug.join("/")}` : "/";

  const viewName = resolveViewForPath(pathname);
  if (!viewName) {
    notFound();
  }

  return <SitePage viewName={viewName} />;
}
