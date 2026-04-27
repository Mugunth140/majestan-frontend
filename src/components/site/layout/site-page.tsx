import { SiteFooter } from "@/components/site/layout/site-footer";
import { SiteHeader } from "@/components/site/layout/site-header";
import { type LegacyViewName, VIEW_COMPONENTS } from "@/lib/site/page-registry";

type SitePageProps = {
  viewName: LegacyViewName;
};

export function SitePage({ viewName }: SitePageProps): React.JSX.Element {
  const ViewComponent = VIEW_COMPONENTS[viewName];

  return (
    <>
      <SiteHeader />
      <ViewComponent />
      <SiteFooter />
    </>
  );
}
