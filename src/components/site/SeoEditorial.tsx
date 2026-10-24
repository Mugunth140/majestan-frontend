import { buildRealEstateSchema } from "@/lib/schema-builder";
import { jsonLd } from "@/lib/seo-engine";

// SEO settings never create visible editorial blocks on detail pages.
export function RealEstateJsonLd({
  record,
  section = "",
}: {
  record: Record<string, any>;
  section?: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(
          buildRealEstateSchema(record, record.seoEngine, section),
        ),
      }}
    />
  );
}
