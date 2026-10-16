"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { SimilarProject, SimilarProperty } from "@/lib/api/similar";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";

/*
 * "Similar properties / projects", drawn in the listing pages' own language:
 * the page's ink heading straight on the page background (no panel around
 * it) and compact cards built from the listing page cards' content. The
 * cards arrive ranked closest-first from the API.
 */

const FOCUS_RING =
  "focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!";

/* Same surface as the listing page cards: white, light grey border, soft
   shadow that deepens toward navy on hover. */
const CARD =
  `group/card flex! w-[78%]! shrink-0! snap-start! flex-col! overflow-hidden! rounded-2xl! border! border-solid! border-gray-200/70! bg-white! no-underline! shadow-sm! transition-shadow! duration-300! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! sm:w-[calc((100%-16px)/2)]! lg:w-[calc((100%-48px)/4)]! ${FOCUS_RING}`;

const toNumber = (raw: unknown): number | null => {
  const n = Number(String(raw ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** ₹ amounts written out the way buyers say them: "₹90 Lakh", "₹1.45 Cr". */
function formatRupees(n: number): string {
  const trim = (v: number) => String(Number(v.toFixed(2)));
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} Lakh`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** "₹90 Lakh – 6 Cr", or a single amount; "Price on request" when unknown. */
function formatPriceRange(min: unknown, max: unknown): string {
  const lo = toNumber(min);
  const hi = toNumber(max);
  if (!lo && !hi) return "Price on request";
  if (!lo || !hi || lo === hi) return formatRupees((lo ?? hi)!);
  const [a, b] = lo < hi ? [lo, hi] : [hi, lo];
  return `${formatRupees(a)} – ${formatRupees(b).replace(/^₹/, "")}`;
}

const sqft = (n: number) => Math.round(n).toLocaleString("en-IN");

function areaRange(min: unknown, max: unknown): string | null {
  const lo = toNumber(min);
  const hi = toNumber(max);
  if (!lo && !hi) return null;
  if (!lo || !hi || Math.round(lo) === Math.round(hi)) return `${sqft((lo ?? hi)!)} sq.ft`;
  return `${sqft(Math.min(lo, hi))} – ${sqft(Math.max(lo, hi))} sq.ft`;
}

function centsRange(min: unknown, max: unknown): string | null {
  const lo = toNumber(min);
  const hi = toNumber(max);
  const trim = (v: number) => String(Number(v.toFixed(2)));
  if (!lo && !hi) return null;
  if (!lo || !hi || lo === hi) return `${trim((lo ?? hi)!)} cents`;
  return `${trim(Math.min(lo, hi))} – ${trim(Math.max(lo, hi))} cents`;
}

const isPlot = (type: string | null | undefined) => /plot|farm/i.test(type ?? "");

function bhkLabel(bhk: number[] | undefined): string | null {
  const values = [...new Set((bhk ?? []).filter((n) => n > 0))].sort((a, b) => a - b);
  if (values.length === 0) return null;
  return values.length === 1 ? `${values[0]} BHK` : `${values.slice(0, -1).join(", ")} & ${values.at(-1)} BHK`;
}

/**
 * The listing card's content, cut to what matters at a glance: photo, name,
 * location, price, and one quiet line of key facts.
 */
function CardShell({
  href,
  image,
  title,
  location,
  price,
  perMonth,
  facts,
}: {
  href: string;
  image: React.ReactNode;
  title: string;
  location: string | null;
  price: string;
  perMonth?: boolean;
  facts: (string | null | undefined)[];
}) {
  const factLine = facts.filter(Boolean).join(" · ");
  return (
    <Link data-card href={href} className={CARD}>
      <div className="relative! aspect-[4/3]! w-full! overflow-hidden! bg-gray-100!">{image}</div>
      <div className="flex! flex-1! flex-col! p-4!">
        <h3 className="m-0! line-clamp-1! text-[16px]! font-semibold! leading-snug! text-[#27427f]!">{title}</h3>
        {location && (
          <p className="m-0! mt-1! flex! min-w-0! items-center! gap-1.5! text-[13px]! text-gray-600!">
            <MapPin className="h-3.5! w-3.5! shrink-0! text-gray-400!" aria-hidden="true" />
            <span className="truncate!">{location}</span>
          </p>
        )}
        <div className="mt-auto! pt-3!">
          <div className="border-t! border-dashed! border-gray-200! pt-3!">
          <p className="m-0! text-[19px]! font-semibold! leading-tight! text-[#27427f]! tabular-nums!">
            {price}
            {perMonth && <span className="text-[13px]! font-medium! text-gray-500!"> /mo</span>}
          </p>
          {factLine && <p className="m-0! mt-1! truncate! text-[13px]! font-medium! text-gray-600!">{factLine}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

const imageClass =
  "h-full! w-full! object-cover! transition-transform! duration-500! ease-out-quint! group-hover/card:scale-[1.04]!";

function PropertyCard({ item }: { item: SimilarProperty }) {
  const price = formatPriceRange(item.expectedSalePrice, item.expectedSalePrice);
  // Plots: plot area and dimensions. Everything else: BHK and built-up area.
  const facts = isPlot(item.propertyType)
    ? [item.plotAreaLabel ?? null, item.plotDimensions ?? null]
    : [item.bedrooms ? `${item.bedrooms} BHK` : null, areaRange(item.builtUpAreaSqft ?? item.areaSqft, null)];
  return (
    <CardShell
      href={item.detailPath}
      image={
        <ListingImage
          src={item.photo}
          placeholderSrc={getPlaceholderImage({ propertyType: item.propertyType })}
          alt={item.propertyName || "Property"}
          className={imageClass}
        />
      }
      title={item.propertyName || "Property"}
      location={item.sublocation}
      price={price}
      perMonth={/rent/i.test(item.postType ?? "") && price !== "Price on request"}
      facts={facts}
    />
  );
}

function ProjectCard({ item }: { item: SimilarProject }) {
  const r = item.ranges;
  // Plot projects: plot sizes and dimensions. Others: BHK options and built-up area.
  const facts = isPlot(item.projectType)
    ? [centsRange(r?.minPlotCents, r?.maxPlotCents), r?.plotDimensions?.slice(0, 2).join(", ") || null]
    : [bhkLabel(r?.bhk), areaRange(r?.minArea, r?.maxArea)];
  return (
    <CardShell
      href={`/${item.canonicalSlug || item.slug}`}
      image={
        <ListingImage
          src={item.coverImageUrl ?? null}
          placeholderSrc={getPlaceholderImage({ projectType: item.projectType })}
          alt={item.name || "Project"}
          className={imageClass}
        />
      }
      title={item.name}
      location={[item.sublocation, item.city].filter(Boolean).join(", ") || null}
      price={formatPriceRange(r?.minPrice, r?.maxPrice)}
      facts={facts}
    />
  );
}

type Props =
  | { kind: "property"; items: SimilarProperty[] }
  | { kind: "project"; items: SimilarProject[] };

export function SimilarListingsSection(props: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  if (props.items.length === 0) return null;

  const noun = props.kind === "property" ? "properties" : "projects";

  const arrow =
    `inline-flex! h-9! w-9! cursor-pointer! items-center! justify-center! rounded-full! border! border-solid! border-[#cfdcf0]! bg-white! text-[#0a0f1c]! transition-[background-color,border-color,color]! duration-150! hover:border-[#0a0f1c]! hover:bg-[#0a0f1c]! hover:text-white! disabled:pointer-events-none! disabled:opacity-35! ${FOCUS_RING}`;

  return (
    <section aria-labelledby="similar-heading" className="font-manrope-page bg-[#f4f6f9]! pb-16!">
      <div className="mx-auto! max-w-7xl! px-4! sm:px-6! lg:px-8!">
          <div className="flex! items-end! justify-between! gap-4!">
            <div className="min-w-0!">
              <h2
                id="similar-heading"
                className="m-0! text-2xl! font-semibold! leading-tight! tracking-[-0.025em]! text-[#0a0f1c]! md:text-3xl!"
              >
                Similar {noun}
              </h2>
            </div>
            {(canPrev || canNext) && (
              <div className="hidden! shrink-0! items-center! gap-2! sm:flex!">
                <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrow} aria-label={`Previous ${noun}`}>
                  <ChevronLeft className="h-4! w-4!" />
                </button>
                <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrow} aria-label={`Next ${noun}`}>
                  <ChevronRight className="h-4! w-4!" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={trackRef}
            className="-mx-4! mt-6! flex! snap-x! snap-mandatory! gap-4! overflow-x-auto! scroll-px-4! px-4! pt-1! pb-3! [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden! sm:-mx-6! sm:scroll-px-6! sm:px-6! lg:mx-0! lg:scroll-px-0! lg:px-0!"
          >
            {props.kind === "property"
              ? props.items.map((item) => <PropertyCard key={item.id} item={item} />)
              : props.items.map((item) => <ProjectCard key={item.id} item={item} />)}
          </div>
      </div>
    </section>
  );
}
