import { notFound } from "next/navigation";
import { listingPageNumber } from "@/lib/seo-pagination";
import { RealEstateJsonLd } from "@/components/site/SeoEditorial";
import Link from "next/link";
import {
  jsonLd,
  listingStructuredData,
  type SeoSnapshot,
} from "@/lib/seo-engine";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
const money = (value: unknown) =>
  value == null ? "Not available" : "₹" + Number(value).toLocaleString("en-IN");
/** Publishing is explicit so pre-existing private staff notes never become public on upgrade. */
export function InventoryEditorial({ seo }: { seo: SeoSnapshot | null }) {
  if (seo?.settings?.publish_editorial_content !== true) return null;
  return <section aria-label="Property guide">
    {seo.intro_content && <div className="max-w-7xl! mx-auto! px-6! py-6!"><TextBlock text={seo.intro_content} /></div>}
    <SeoHighlights seo={seo} />
    <SeoLocalityBottom seo={seo} />
  </section>;
}
export function SeoJsonLd({ seo }: { seo: SeoSnapshot | null }) {
  return seo?.json_ld ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(seo.json_ld) }}
    />
  ) : null;
}
/** A limited inline Markdown renderer; React escapes all text and HTML. */
function inlineMarkdown(text: string, depth = 0): React.ReactNode {
  if (depth >= 8) return text;
  const pattern =
    /`([^`\n]+)`|\[([^\]\n]+)\]\(([^()\s]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_/g;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    parts.push(text.slice(cursor, index));
    const key = `${index}:${match[0].length}`;
    if (match[1] !== undefined) parts.push(<code key={key}>{match[1]}</code>);
    else if (match[2] !== undefined) {
      const href = match[3];
      const allowed =
        !/[\\\u0000-\u0020\u007f]/.test(href) &&
        (/^\/(?!\/)/.test(href) || /^(?:https?:\/\/|mailto:|tel:)/i.test(href));
      parts.push(
        allowed ? (
          <a key={key} href={href} className="underline! text-blue-700!">
            {inlineMarkdown(match[2], depth + 1)}
          </a>
        ) : (
          match[0]
        ),
      );
    } else if (match[4] !== undefined || match[5] !== undefined)
      parts.push(
        <strong key={key}>
          {inlineMarkdown(match[4] ?? match[5], depth + 1)}
        </strong>,
      );
    else
      parts.push(
        <em key={key}>{inlineMarkdown(match[6] ?? match[7], depth + 1)}</em>,
      );
    cursor = index + match[0].length;
  }
  parts.push(text.slice(cursor));
  return parts;
}
/** Deliberately supports Markdown text, headings and lists; raw HTML stays escaped. */
export function TextBlock({ text }: { text: string }) {
  const blocks = String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .filter(Boolean);
  return (
    <div className="space-y-4!">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line)))
          return (
            <ul key={i} className="list-disc! pl-6! space-y-2!">
              {lines.map((line, j) => (
                <li key={j}>{inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        if (lines.every((line) => /^\d+\.\s+/.test(line)))
          return (
            <ol key={i} className="list-decimal! pl-6! space-y-2!">
              {lines.map((line, j) => (
                <li key={j}>{inlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        return (
          <div key={i}>
            {lines.map((line, j) =>
              /^###\s+/.test(line) ? (
                <h3 key={j} className="text-xl! font-semibold!">
                  {inlineMarkdown(line.replace(/^###\s+/, ""))}
                </h3>
              ) : /^#{1,2}\s+/.test(line) ? (
                <h2 key={j} className="text-2xl! font-semibold!">
                  {inlineMarkdown(line.replace(/^#{1,2}\s+/, ""))}
                </h2>
              ) : (
                <p key={j} className="leading-relaxed!">
                  {inlineMarkdown(line)}
                </p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
export function SeoOffMarketBanner({ seo }: { seo: SeoSnapshot | null }) {
  return seo?.off_market ? (
    <aside
      role="status"
      className="max-w-7xl! mx-auto! my-4! px-6! py-4! rounded-lg! border! border-amber-200! bg-amber-50! text-amber-950!"
    >
      {seo.target_snapshot?.status === "sold"
        ? "This property has been sold."
        : seo.target_snapshot?.status === "rented"
          ? "This property has been rented."
          : "This listing is currently unavailable."}{" "}
      Contact Majestan Realty for available alternatives.
      {seo.redirect_target_path && (
        <Link className="ml-2! underline!" href={seo.redirect_target_path}>
          View available listings
        </Link>
      )}
    </aside>
  ) : null;
}
export function SeoEntityDetails({ seo }: { seo: SeoSnapshot | null }) {
  const entity = seo?.entity || {};
  const labels: Record<string, string> = {
    builder_name: "Developer",
    rera_number: "RERA registration",
    approval_authority: "Approval authority",
    sub_locality_override: "Locality",
    pincode: "PIN code",
    unit_configurations: "Unit configurations",
    total_units: "Total units",
    total_area_acres: "Total area (acres)",
    possession_status: "Possession status",
    possession_date: "Possession date",
    price_per_sqft: "Price per sq.ft",
    price_override: "Price (INR)",
    low_price: "Starting price (INR)",
    high_price: "Maximum price (INR)",
    transaction_display: "Transaction",
    plot_area_unit: "Plot area unit",
    builtup_area_sqft: "Built-up area (sq.ft)",
    plot_area: "Plot area",
    bhk_config: "BHK configuration",
    commercial_specs: "Commercial specifications",
    land_specs: "Land specifications",
    approval_status: "Approval status",
    furnishing_status: "Furnishing",
    facing_direction: "Facing",
  };
  const facts = Object.entries(labels).filter(
    ([key]) =>
      entity[key] !== undefined && entity[key] !== null && entity[key] !== "",
  );
  const landmarks =
    seo?.nearby_landmarks || seo?.settings?.nearby_landmarks || [];
  const readable = (value: unknown): string =>
    typeof value === "object" && value !== null
      ? Object.entries(value)
          .map(([key, val]) => `${key.replaceAll("_", " ")}: ${String(val)}`)
          .join("; ")
      : String(value);
  if (!facts.length && !landmarks.length) return null;
  return (
    <section
      className="max-w-7xl! mx-auto! px-6! py-6!"
      aria-label="Property facts"
    >
      {facts.length > 0 && (
        <dl className="grid! grid-cols-1! sm:grid-cols-2! gap-4!">
          {facts.map(([key, label]) => (
            <div key={key}>
              <dt className="font-semibold!">{label}</dt>
              <dd>{readable(entity[key])}</dd>
            </div>
          ))}
        </dl>
      )}
      {landmarks.length > 0 && (
        <div className="mt-6!">
          <h2 className="text-xl! font-semibold! mb-3!">Nearby landmarks</h2>
          <ul className="list-disc! pl-6!">
            {landmarks
              .filter((place: any) => place?.name)
              .map((place: any, i: number) => (
                <li key={i}>
                  {place.name}
                  {place.category ? ` (${place.category})` : ""}
                  {place.distance_km !== null &&
                  place.distance_km !== undefined &&
                  place.distance_km !== ""
                    ? ` — ${place.distance_km} km`
                    : ""}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
export function SeoHighlights({ seo }: { seo: SeoSnapshot | null }) {
  const summaryValue = seo?.settings?.ai_summary || seo?.ai_summary;
  const summary = typeof summaryValue === "string" ? summaryValue.trim() : "";
  const highlights = (seo?.key_highlights || seo?.highlights || []).filter(
    Boolean,
  );
  const heading = seo?.h2;
  if (!summary && !highlights.length && !heading) return null;
  return (
    <section
      className="max-w-7xl! mx-auto! px-6! py-6!"
      aria-label="Key highlights"
    >
      {heading && <h2 className="text-2xl! font-semibold! mb-4!">{heading}</h2>}
      {summary && <p className="mb-4! leading-relaxed!">{summary}</p>}
      {highlights.length > 0 && (
        <ul className="list-disc! pl-6! space-y-2!">
          {highlights.map((h: string, i: number) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
export function SeoLocalityContent({
  seo,
  heading = true,
}: {
  seo: SeoSnapshot | null;
  heading?: boolean;
}) {
  if (!seo) return null;
  const stats = seo.stats,
    rent = stats?.intent === "rent";
  return (
    <section className="max-w-7xl! mx-auto! px-6! py-8! space-y-6! font-manrope-page">
      {heading && seo.h1 && (
        <h1 className="text-3xl! md:text-4xl! font-semibold! text-balance!">
          {seo.h1}
        </h1>
      )}
      {seo.h2 && <h2 className="text-2xl! font-semibold!">{seo.h2}</h2>}
      {seo.intro_content && <TextBlock text={seo.intro_content} />}
      {stats &&
        seo.show_live_market_snapshot !== false &&
        seo.rule?.show_live_market_snapshot !== false && (
          <div className="overflow-auto! rounded-xl! border! border-slate-200! bg-white! p-6!">
            <table className="w-full! text-left! text-sm!">
              <caption className="text-left! text-lg! font-semibold! mb-4! text-slate-900!">
                Live inventory snapshot
              </caption>
              <tbody>
                <tr>
                  <th className="p-3!">Total active matching listings</th>
                  <td className="p-3!">{stats.total}</td>
                </tr>
                <tr>
                  <th className="p-3!">
                    {rent ? "Monthly rent range" : "Asking price range"}
                  </th>
                  <td className="p-3!">
                    {money(stats.min_price)} – {money(stats.max_price)}
                  </td>
                </tr>
                <tr>
                  <th className="p-3!">
                    Average {rent ? "monthly rent" : "asking price"} / sq.ft
                  </th>
                  <td className="p-3!">{money(stats.average_price_sqft)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs! text-slate-500! mt-4!">
              Source: Majestan Realty live inventory. Prices are asking prices.
              Area statistics use {stats.price_sqft_sample_count} listings with
              known price and area.
            </p>
          </div>
        )}
    </section>
  );
}
export function SeoLocalityBottom({ seo }: { seo: SeoSnapshot | null }) {
  if (!seo) return null;
  return (
    <section className="max-w-7xl! mx-auto! px-6! py-8! space-y-8! font-manrope-page">
      {seo.bottom_content && <TextBlock text={seo.bottom_content} />}{" "}
      {seo.faqs?.length > 0 && (
        <div>
          <h2 className="text-2xl! font-semibold! mb-6!">
            Frequently asked questions
          </h2>
          {seo.faqs.map((f: any, i: number) => (
            <details
              key={i}
              className="rounded-lg! border! border-slate-200! p-4! mb-4! bg-white!"
            >
              <summary className="font-semibold! cursor-pointer!">
                {f.question}
              </summary>
              <p className="mt-4!">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
export function SeoListingPage({
  seo,
  page = 1,
}: {
  seo: SeoSnapshot;
  page?: number;
}) {
  const pages = Math.max(1, Math.ceil((seo.items?.length || 0) / 12)),
    current = listingPageNumber(String(page));
  if (current > pages) notFound();
  const visible = (seo.items || []).slice((current - 1) * 12, current * 12);
  // Keep the inventory schema aligned with this visible page of results.
  // Editorial FAQs are visible plain content; no FAQ search enhancement is assumed.
  const listingSeo = {
    ...seo,
    json_ld: listingStructuredData(seo, {
      "@type": "ItemList",
      name: seo.h1,
      url: "https://www.majestanrealty.com" + seo.path + (current > 1 ? "?page=" + current : ""),
      itemListElement: visible.map((p: any, i: number) => ({
        "@type": "ListItem",
        position: (current - 1) * 12 + i + 1,
        url: "https://www.majestanrealty.com/" + p.slug,
        name: p.title,
      })),
    }),
  };
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-h)]! bg-[#f5f7f4]! min-h-screen! font-manrope-page">
        <div className="max-w-7xl! mx-auto! px-6! pt-6!">
          <Breadcrumbs items={[{ label: seo.h1 || "Properties" }]} />
        </div>
        <SeoLocalityContent seo={seo} />
        <div className="max-w-7xl! mx-auto! px-6! pb-8!">
          <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-6!">
            {(seo.items || [])
              .slice((current - 1) * 12, current * 12)
              .map((p: any) => (
                <article
                  key={p.id}
                  className="bg-white! rounded-xl! border! border-slate-200! overflow-hidden!"
                >
                  <Link href={"/" + p.slug} className="block! p-6!">
                    <p className="text-xs! uppercase! text-emerald-700! mb-3!">
                      {p.type.replaceAll("_", " ")}
                    </p>
                    <h2 className="text-xl! font-semibold! mb-3!">{p.title}</h2>
                    <p className="text-lg!">
                      {p.price ? money(p.price) : "Price on request"}
                      {seo.rule?.transaction_intent === "rent"
                        ? " / month"
                        : ""}
                    </p>
                    <span className="block! mt-6! text-sm! text-emerald-700!">
                      View property →
                    </span>
                  </Link>
                </article>
              ))}
          </div>
          {!seo.items?.length && (
            <p>
              No matching active listings at present. Contact Majestan Realty
              for alternatives.
            </p>
          )}
          <nav className="flex! gap-4! mt-8!" aria-label="Listing pagination">
            {current > 1 && (
              <Link href={seo.path + "?page=" + (current - 1)}>← Previous</Link>
            )}
            <span>
              Page {current} of {pages}
            </span>
            {current < pages && (
              <Link href={seo.path + "?page=" + (current + 1)}>Next →</Link>
            )}
          </nav>
        </div>
        <SeoLocalityBottom seo={seo} />
        <SeoJsonLd seo={listingSeo} />
      </main>
      <SiteFooter />
    </>
  );
}

/** Off-market inventory retains useful, factual content without claiming availability. */
export function SeoOffMarketPage({
  seo,
  section,
}: {
  seo: SeoSnapshot;
  section?: string;
}) {
  const target = seo.target_snapshot || {};
  const name = target.name || target.title || "Property";
  const heading = section ? `${name} ${section.replaceAll("-", " ")}` : name;
  const media = (seo.media || target.media || []).filter((image: any) =>
    section?.startsWith("floor-plan") ? /floor/.test(image.kind || "") : true,
  );
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-h)]! min-h-screen! font-manrope-page">
        <SeoOffMarketBanner seo={seo} />
        <RealEstateJsonLd
          record={{
            ...target,
            canonicalSlug: seo.path.replace(/^\//, ""),
            seoEngine: seo,
            projectType:
              seo.scope === "project"
                ? target.projectType || "apartment"
                : undefined,
          }}
          section={section}
        />
        <div className="max-w-7xl! mx-auto! px-6! py-6! space-y-6!">
          <Breadcrumbs
            items={[
              { label: name, ...(section ? { href: seo.path } : {}) },
              ...(section ? [{ label: heading }] : []),
            ]}
          />
          <h1 className="text-3xl! font-semibold!">{heading}</h1>
          {target.description && <TextBlock text={target.description} />}
          <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4!">
            {media.map((image: any, i: number) => {
              const entry =
                seo.image_alts?.[image.key] ||
                seo.image_alts?.[image.image_url] ||
                {};
              return (
                <figure key={image.key || i} className="m-0!">
                  {!/[.]pdf(?:$|[?#])/i.test(image.image_url || "") && (
                    <img
                      src={image.image_url}
                      alt={
                        entry.alt_text ||
                        `${name} ${image.kind?.includes("floor") ? "floor plan" : "photo"} ${i + 1}`
                      }
                      title={entry.title_text}
                      className="w-full! rounded-lg!"
                    />
                  )}
                </figure>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
