import { Card, BODY } from "@/components/site/project/project-ui";
import { NearbyPlaces } from "@/components/site/project/overview/location-parts";
import { buildRealEstateSchema } from "@/lib/schema-builder";
import { jsonLd } from "@/lib/seo-engine";
export function SeoEditorial({
  record,
  locality = false,
  footer = false,
}: {
  record: Record<string, any>;
  locality?: boolean;
  footer?: boolean;
}) {
  const seo = record.seoEngine || {},
    settings = seo.settings || {};
  if (locality) {
    const legacy = record.seo?.seoData?.locality || {};
    const copy = [
      ...new Set(
        [
          "content_overview",
          "content_connectivity",
          "content_education",
          "content_healthcare",
          "content_shopping",
        ]
          .map((key) => legacy[key])
          .filter(
            (value): value is string =>
              typeof value === "string" && Boolean(value.trim()),
          ),
      ),
    ];
    // Sierra's nearby-place cards already render these facts. Only show additional
    // editorial landmarks here, rather than printing the same inventory twice.
    const categories = [
      ...(record.nearbyCategories || []),
      ...(record.locations?.[0]?.localityData?.categories || []),
      ...(legacy.categories || []),
    ];
    const normalize = (name: string) =>
      name.trim().toLowerCase().replace(/\s+/g, " ");
    const seen = new Set<string>(
      categories.flatMap((category: any) =>
        (category.places || [])
          .filter((place: any) => typeof place.name === "string")
          .map((place: any) => normalize(place.name)),
      ),
    );
    const groups = new Map<
      string,
      { title: string; places: { name: string; distance?: string }[] }
    >();
    const landmarks = Array.isArray(settings.nearby_landmarks)
      ? settings.nearby_landmarks
      : [];
    for (const landmark of landmarks) {
      if (typeof landmark?.name !== "string" || !landmark.name.trim()) continue;
      const key = normalize(landmark.name);
      if (seen.has(key)) continue;
      seen.add(key);
      const title =
        typeof landmark.category === "string" && landmark.category.trim()
          ? landmark.category.trim()
          : "Nearby landmarks";
      const groupKey = normalize(title);
      const group: {
        title: string;
        places: { name: string; distance?: string }[];
      } = groups.get(groupKey) || { title, places: [] };
      const distance = landmark.distance_km;
      group.places.push({
        name: landmark.name.trim(),
        distance:
          distance != null &&
          distance !== "" &&
          Number.isFinite(Number(distance)) &&
          Number(distance) >= 0
            ? `${Number(distance)} km`
            : undefined,
      });
      groups.set(groupKey, group);
    }
    if (!copy.length && !groups.size) return null;
    return (
      <Card title="Locality guide" id="seo-locality-guide">
        <div className="mt-4! flex! flex-col! gap-4!">
          {copy.map((text, index) => (
            <p className={`${BODY} whitespace-pre-line!`} key={index}>
              {text}
            </p>
          ))}
          {groups.size > 0 && (
            <NearbyPlaces categories={[...groups.values()]} />
          )}
        </div>
      </Card>
    );
  }
  if (footer)
    return settings.bottom_content ? (
      <details>
        <summary>More about this property</summary>
        <div className="whitespace-pre-line!">{settings.bottom_content}</div>
      </details>
    ) : null;
  const highlights = seo.highlights || [];
  return (
    <>
      {settings.intro_content && (
        <p className="whitespace-pre-line!">{settings.intro_content}</p>
      )}
      {(settings.ai_summary || highlights.length > 0) && (
        <section aria-label="Key Highlights & Summary">
          <h2>Key Highlights &amp; Summary</h2>
          {settings.ai_summary && <p>{settings.ai_summary}</p>}
          <ul>
            {highlights.map((h: string, i: number) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
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
