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
  // Listings keep their inventory-derived heading and body. The shared footer
  // must not inject admin editorial copy or FAQ markup into these routes.
  const isListing = path === "/projects" || seo?.scope === "listing";
  const schema = seo?.json_ld;
  const nodes = Array.isArray(schema?.["@graph"])
    ? schema["@graph"]
    : Array.isArray(schema)
      ? schema
      : schema
        ? [schema]
        : [];
  const metadataSeo =
    isListing && seo
      ? {
          ...seo,
          json_ld: {
            "@context": schema?.["@context"] || "https://schema.org",
            "@graph": nodes.filter((node: Record<string, any>) => {
              const types = Array.isArray(node["@type"])
                ? node["@type"]
                : [node["@type"]];
              return !types.includes("FAQPage");
            }),
          },
        }
      : seo;
  const footerContent = isListing ? (
    <SeoJsonLd seo={metadataSeo} />
  ) : (
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
      heading={isListing ? undefined : seo?.h1}
      footerContent={footerIsOutside ? null : footerContent}
    >
      {children}
      {footerIsOutside && footerContent}
    </SeoHeadingProvider>
  );
}
