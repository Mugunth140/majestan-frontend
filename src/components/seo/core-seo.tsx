import { getSeo } from "@/lib/seo-engine";
import { SeoJsonLd } from "./seo-content";
import { SeoHeadingProvider } from "./core-heading";
export async function CoreSeoBoundary({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const seo = await getSeo(path);
  // Admin editorial copy (intro, highlights, bottom content, FAQs) is never
  // rendered on public pages; only metadata and JSON-LD ship. FAQPage schema
  // is dropped because Google requires FAQ markup to match visible content.
  const isListing = path === "/projects" || seo?.scope === "listing";
  const schema = seo?.json_ld;
  const nodes = Array.isArray(schema?.["@graph"])
    ? schema["@graph"]
    : Array.isArray(schema)
      ? schema
      : schema
        ? [schema]
        : [];
  const metadataSeo = seo && {
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
  };
  const footerContent = <SeoJsonLd seo={metadataSeo} />;
  const footerIsOutside = ["/about-us", "/contact-us", "/emi-calculator", "/affordability-calculator"].includes(path);
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
