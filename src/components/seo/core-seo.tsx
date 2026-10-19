import { getSeo } from "@/lib/seo-engine";
import { SeoJsonLd, SeoHighlights } from "./seo-content";
import { SeoHeadingProvider } from "./core-heading";
export async function CoreSeoBoundary({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const seo = await getSeo(path);
  return (
    <SeoHeadingProvider heading={seo?.h1}>
      {children}
      <SeoHighlights seo={seo} />
      <SeoJsonLd seo={seo} />
    </SeoHeadingProvider>
  );
}
