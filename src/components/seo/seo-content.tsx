import Link from "next/link";
import { jsonLd, type SeoSnapshot } from "@/lib/seo-engine";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
const money = (value: unknown) =>
  value == null ? "Not available" : "₹" + Number(value).toLocaleString("en-IN");
export function SeoJsonLd({ seo }: { seo: SeoSnapshot | null }) {
  return seo?.json_ld ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(seo.json_ld) }}
    />
  ) : null;
}
function TextBlock({ text }: { text: string }) {
  return (
    <div className="space-y-4!">
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((p, i) =>
          p.startsWith("## ") ? (
            <h2 key={i} className="text-2xl! font-semibold!">
              {p.replace(/^##\s+/, "")}
            </h2>
          ) : (
            <p key={i} className="whitespace-pre-line! leading-relaxed!">
              {p}
            </p>
          ),
        )}
    </div>
  );
}
export function SeoHighlights({ seo }: { seo: SeoSnapshot | null }) {
  const summaryValue = seo?.settings?.ai_summary || seo?.ai_summary;
  const summary = typeof summaryValue === "string" ? summaryValue.trim() : "";
  const highlights = seo?.highlights?.filter(Boolean) || [];
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
      {stats && (
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
    current = Math.min(Math.max(page, 1), pages);
  const visible = (seo.items || []).slice((current - 1) * 12, current * 12);
  const listingSeo = {
    ...seo,
    json_ld: {
      ...seo.json_ld,
      "@graph": (seo.json_ld?.["@graph"] || []).map((node: any) =>
        node["@type"] === "ItemList"
          ? {
              ...node,
              itemListElement: visible.map((p: any, i: number) => ({
                "@type": "ListItem",
                position: (current - 1) * 12 + i + 1,
                url: "https://www.majestanrealty.com/" + p.slug,
                name: p.title,
              })),
            }
          : node,
      ),
    },
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
