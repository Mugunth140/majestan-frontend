import { getSeo } from "@/lib/seo-engine";
import {
  SeoJsonLd,
  SeoHighlights,
  SeoLocalityBottom,
  TextBlock,
} from "./seo-content";
import { SeoHeadingProvider } from "./core-heading";
export async function CoreSeoBoundary({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const seo = await getSeo(path);
  const footerContent = (
    <>
      {seo?.intro_content && (
        <section
          className="max-w-7xl! mx-auto! px-6! pt-8!"
          aria-label="Overview"
        >
          <TextBlock text={seo.intro_content} />
        </section>
      )}
      <SeoHighlights seo={seo} />
      <SeoLocalityBottom seo={seo} />
      <SeoJsonLd seo={seo} />
    </>
  );
  const footerIsOutside = ["/about-us", "/contact-us"].includes(path);
  return (
    <SeoHeadingProvider
      heading={seo?.h1}
      footerContent={footerIsOutside ? null : footerContent}
    >
      {children}
      {footerIsOutside && footerContent}
    </SeoHeadingProvider>
  );
}
