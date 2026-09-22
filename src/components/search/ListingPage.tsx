"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";
import { LocalityMap } from "./LocalityMap";
import { CustomSelect } from "./CustomSelect";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { MobileFilterBar } from "./MobileFilterBar";
import type { ListingAdapter, ListingPageData } from "./listing-adapter";

// ─── helpers ────────────────────────────────────────────────────────────────

function countActiveFilters(filters: Record<string, string>): number {
  const ignoredKeys = new Set(["listingType", "propertyType", "location", "city"]);
  return Object.entries(filters).filter(
    ([k, v]) => !ignoredKeys.has(k) && v !== ""
  ).length;
}

function getLocationLabel(filters: Record<string, string>): string {
  const loc = filters.location || filters.city || "";
  if (!loc) return "All Areas";
  return loc
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getPriceLabel(filters: Record<string, string>): string {
  const min = filters.minPrice;
  const max = filters.maxPrice;
  if (!min && !max) return "Any Price";
  const fmt = (v: string) => {
    const n = Number(v);
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(0)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function getBedsLabel(filters: Record<string, string>): string {
  const b = filters.bedrooms || filters.bhk || "";
  if (!b) return "Any Beds";
  return `${b} BHK`;
}

function getTypeLabel(filters: Record<string, string>): string {
  const t = filters.propertyType || filters.projectType || "";
  if (!t) return "All Types";
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

// ─── default right rail ─────────────────────────────────────────────────────

// ─── skeletons (SSR-safe: no hooks, so they prerender for Suspense fallback) ─

// ─── skeletons (SSR-safe: no hooks, so they prerender for Suspense fallback) ─
// Every block mirrors the real component's geometry 1:1 (same paddings,
// sizes, gaps) with a `.shimmer` sweep — so the swap to real content is
// invisible and causes zero layout shift.

const SHIMMER_DELAYS = ["", "shimmer-d1", "shimmer-d2"];

function CardSkeleton({ index = 0 }: { index?: number }) {
  const d = SHIMMER_DELAYS[index % SHIMMER_DELAYS.length];
  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-2xl! border! border-gray-200/70! shadow-sm! flex! flex-col! lg:flex-row! overflow-hidden! min-w-0!">
      {/* Photo — same geometry as the real image (stretch to content on desktop) */}
      <div className="relative! w-full! aspect-square! lg:aspect-auto! lg:w-[300px]! lg:h-auto! lg:self-stretch! lg:min-h-[240px]! shrink-0! overflow-hidden! bg-gray-100!">
        <div className={`absolute! inset-0! bg-gray-200! shimmer! ${d}`} />
      </div>
      <div className="px-5! py-3! flex! flex-col! flex-1! min-w-0! justify-center!">
        {/* Title + wishlist/share */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <div className={`h-[22px]! rounded-md! bg-gray-200! w-3/5! shimmer! ${d}`} />
            <div className="flex! items-center! gap-1.5! mt-1!">
              <div className="w-3.5! h-3.5! rounded-full! bg-gray-200! shrink-0!" />
              <div className={`h-[18px]! rounded-md! bg-gray-100! w-1/2! shimmer! ${d}`} />
            </div>
          </div>
          <div className="w-8! h-8! rounded-full! bg-gray-100! shrink-0!" />
          <div className="w-8! h-8! rounded-full! bg-gray-100! shrink-0!" />
        </div>
        {/* Price — mirrors real card (dotted divider above, above spec table) */}
        <div className="mt-3! border-t! border-dashed! border-gray-200! pt-3! flex! items-end! gap-3! leading-none!">
          <div className={`h-[26px]! rounded-md! bg-gray-200! w-32! shimmer! ${d}`} />
          <div className="h-[16px]! rounded! bg-gray-100! w-20!" />
        </div>
        {/* Spec table */}
        <div className="mt-3! border-y! border-dashed! border-gray-200! py-3! grid! grid-cols-2! sm:grid-cols-4! gap-x-3! gap-y-4!">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="min-w-0!">
              <div className="h-[15px]! rounded! bg-gray-100! w-2/3!" />
              <div className={`h-[18px]! rounded! bg-gray-200! w-4/5! mt-0.5! shimmer! ${d}`} />
            </div>
          ))}
        </div>
        {/* Section links — separated by the spec table's bottom dotted line */}
        <div className="flex! flex-wrap! items-center! justify-center! gap-x-7! gap-y-2! mt-3!">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[18px]! rounded! bg-gray-100! w-20!" />
          ))}
        </div>
        {/* Actions */}
        <div className="mt-3! flex! flex-col! sm:flex-row! gap-2.5!">
          <div className={`h-[42px]! rounded-xl! bg-gray-100! flex-1! shimmer! ${d}`} />
          <div className={`h-[42px]! rounded-xl! bg-gray-200! flex-1! shimmer! ${d}`} />
        </div>
      </div>
    </div>
  );
}

/**
 * Full page-shape placeholder used as the Suspense fallback while the
 * client-side listing shell (useSearchParams) boots. It mirrors the real
 * layout (sidebar + sticky row + title + cards + pagination) so the
 * header/footer don't jump when the real content hydrates in — no layout
 * shift on refresh.
 */
export function ListingShellSkeleton() {
  return (
    <div className="max-w-[1120px]! mx-auto! px-4! sm:px-6! lg:px-8! pt-0! pb-16!" aria-hidden="true">
      <div className="flex! gap-6! items-start!">
        {/* ── Sidebar — mirrors PropertySearchFilters + map ── */}
        <aside className="hidden! lg:flex! lg:flex-col! lg:gap-4! w-[280px]! shrink-0! pt-4! pb-6! pr-1!">
          <div className="bg-white! rounded-xl! border! border-gray-200/70! shadow-sm! w-full!">
            {/* Header: title + reset */}
            <div className="px-5! py-4! border-b! border-gray-100! flex! items-center! justify-between!">
              <div className="h-[18px]! rounded-md! bg-gray-200! w-24! shimmer!" />
              <div className="h-[28px]! rounded-lg! bg-gray-100! w-14!" />
            </div>
            {/* Search + Buy/Rent toggle */}
            <div className="px-5! py-4!">
              <div className="h-[42px]! rounded-lg! bg-gray-100! shimmer!" />
              <div className="flex! bg-gray-100! p-1! rounded-lg! gap-1! mt-3!">
                <div className="flex-1! h-[36px]! rounded-md! bg-white! shadow-sm!" />
                <div className="flex-1! h-[36px]! rounded-md!" />
              </div>
            </div>
            {/* Accordion sections — Location open, rest collapsed */}
            <div className="px-5! pb-2! border-t! border-gray-100!">
              <div className="border-b! border-gray-100!">
                <div className="py-3.5! flex! items-center! justify-between!">
                  <div>
                    <div className="h-[16px]! rounded! bg-gray-200! w-20! shimmer!" />
                    <div className="h-[13px]! rounded! bg-gray-100! w-28! mt-1!" />
                  </div>
                  <div className="w-4! h-4! rounded-full! bg-gray-200! shrink-0!" />
                </div>
                <div className="pb-4!">
                  <div className="h-[42px]! rounded-lg! bg-gray-100! border! border-gray-200! shimmer! shimmer-d1!" />
                </div>
              </div>
              {["Property Type", "Price Range", "Bedrooms", "More Filters"].map((label) => (
                <div key={label} className="border-b! border-gray-100! last:border-b-0!">
                  <div className="py-3.5! flex! items-center! justify-between!">
                    <div className="h-[16px]! rounded! bg-gray-100! w-24!" />
                    <div className="w-4! h-4! rounded-full! bg-gray-100! shrink-0!" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Map */}
          <div className="h-[240px]! rounded-2xl! overflow-hidden! border! border-gray-100! bg-gray-200! shimmer! shrink-0!" />
        </aside>
        {/* ── Main column ── */}
        <main className="flex-1! min-w-0! flex! flex-col! pt-3!">
          {/* Sticky row: breadcrumbs + sort */}
          <div className="py-1! mb-3! -mx-4! lg:mx-0! px-4! lg:px-0!">
            <div className="flex! flex-row! items-center! justify-between! gap-3!">
              <div className="flex! items-center! gap-2! flex-1! min-w-0!">
                <div className="w-4! h-4! rounded-full! bg-gray-200! shrink-0!" />
                <div className="h-3.5! rounded! bg-gray-200! w-16! shimmer!" />
                <div className="h-3.5! rounded! bg-gray-200! w-20! shimmer! shimmer-d1!" />
                <div className="h-3.5! rounded! bg-gray-200! w-24! hidden! sm:block! shimmer! shimmer-d2!" />
              </div>
              <div className="shrink-0! w-[180px]! hidden! lg:block!">
                <div className="h-[42px]! rounded-full! bg-gray-100! shimmer!" />
              </div>
            </div>
          </div>
          {/* Title */}
          <div className="min-w-0! mt-0! mb-4! flex! items-center! gap-3!">
            <div className="h-[28px]! rounded-lg! bg-gray-200! w-40! shimmer!" />
            <div className="h-[28px]! rounded-lg! bg-gray-100! w-64! hidden! sm:block!" />
          </div>
          {/* Mobile chips */}
          <div className="lg:hidden! mb-4! flex! gap-2!">
            <div className="h-8! rounded-full! bg-gray-100! w-20!" />
            <div className="h-8! rounded-full! bg-gray-100! w-24!" />
            <div className="h-8! rounded-full! bg-gray-100! w-16!" />
          </div>
          {/* Cards */}
          <div className="flex! flex-col! gap-3!">
            <CardSkeleton index={0} />
            <CardSkeleton index={1} />
            <CardSkeleton index={2} />
          </div>
          {/* Pagination */}
          <div className="mt-8! pt-6! border-t! border-gray-200/60! flex! flex-col! items-center! gap-3.5!">
            <div className="h-[18px]! rounded! bg-gray-100! w-48!" />
            <div className="flex! flex-wrap! items-center! justify-center! gap-1!">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9! h-9! rounded-lg! bg-gray-100!" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── floating whatsapp enquiry popup ────────────────────────────────────────

function WhatsAppPopup({
  pageUrl,
  listingType,
  propertyType,
  location,
}: {
  pageUrl: string;
  listingType?: string;
  propertyType?: string;
  location?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])'
        )
      ).filter((el) => el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !cardRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Please enter your name.");
      setStatus("error");
      return;
    }
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await createEnquiry({
        name: trimmed,
        phone: normalized,
        source: "whatsapp_popup",
        pageUrl: pageUrl + window.location.search,
        listingType,
        propertyType,
        location,
        whatsappOptIn: true,
      });
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      {open && (
        <button
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          className="fixed! inset-0! z-[9998]! cursor-default!"
        />
      )}
    <div className="fixed! bottom-6! right-5! z-[9999]! flex! flex-col! items-end! gap-3!">
      {/* Expanded card */}
      {open && (
        <div
          ref={cardRef}
          className="w-[300px]! bg-white! rounded-2xl! shadow-[0_8px_40px_rgba(0,0,0,0.18)]! border! border-gray-100! overflow-hidden! animate-in! fade-in! slide-in-from-bottom-4! duration-200!"
        >
          {/* Header */}
          <div className="flex! items-center! justify-between! px-4! py-3! bg-[#27427f]!">
            <div className="flex! items-center! gap-2!">
              <MessageCircle className="w-4! h-4! text-white! fill-white!" />
              <span className="text-[13px]! font-semibold! text-white! font-['Manrope',sans-serif]!">
                Get Details via WhatsApp
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/70! hover:text-white! transition-colors! cursor-pointer!"
            >
              <X className="w-4! h-4!" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4! flex! flex-col! gap-3!">
            {status === "success" ? (
              <p className="text-[13px]! text-blue-950! font-medium! leading-relaxed! py-2! font-['Manrope',sans-serif]!">
                Thanks {name.trim().split(" ")[0] || "there"}! Our team will reach out to you shortly.
              </p>
            ) : (
              <form
                className="flex! flex-col! gap-2.5!"
                onSubmit={handleSubmit}
              >
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full! p-3! text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400! font-['Manrope',sans-serif]!"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                  pattern="[0-9+ ]{10,15}"
                  className="w-full! p-3! text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400! font-['Manrope',sans-serif]!"
                />
                {status === "error" && errorMsg && (
                  <p className="text-[12px]! text-red-600! font-medium! font-['Manrope',sans-serif]!">
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex! items-center! justify-center! gap-2! w-full! py-2.5! bg-[#27427f]! text-white! text-sm! font-semibold! rounded-xl! cursor-pointer! hover:bg-[#1a2d59]! transition-colors! disabled:opacity-60! disabled:cursor-not-allowed! font-['Manrope',sans-serif]!"
                >
                  {status === "submitting" ? "Requesting..." : "Request Callback"}
                </button>
                <p className="text-[11px]! text-gray-500! text-center! leading-relaxed! font-['Manrope',sans-serif]!">
                  By enquiring, you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#27427f]! font-semibold! hover:underline!"
                  >
                    Terms &amp; Conditions.
                  </Link>
                </p>
              </form>
            )}
            <a
              href="tel:+914222345678"
              className="flex! items-center! justify-center! gap-2! w-full! py-2.5! border! border-[#27427f]/25! text-[#27427f]! text-sm! font-semibold! rounded-xl! no-underline! hover:bg-[#27427f]/5! transition-colors! font-['Manrope',sans-serif]!"
            >
              <Phone className="w-3.5! h-3.5! fill-[#27427f]!" />
              Call Now
            </a>
          </div>
        </div>
      )}

      {/* Trigger pill — only visible when popup is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Get Details via WhatsApp"
          className="flex! items-center! gap-2! px-4! py-4! bg-[#27427f]! text-white! text-[13px]! font-semibold! rounded-full! shadow-lg! hover:bg-[#1a2d59]! transition-all! duration-200! cursor-pointer! font-['Manrope',sans-serif]! whitespace-nowrap!"
        >
          <MessageCircle className="w-5! h-5! shrink-0! fill-white!" />
          {/* Get Details via WhatsApp */}
        </button>
      )}
    </div>
    </>
  );
}

function DefaultRightRail() {
  return null;
}


// ─── shell ──────────────────────────────────────────────────────────────────

export function ListingShell<TFilters extends Record<string, string>, TItem>({
  adapter,
  initialFilters,
  initialData,
}: {
  adapter: ListingAdapter<TFilters, TItem>;
  initialFilters: TFilters;
  initialData?: ListingPageData<TItem> | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const queryClient = useQueryClient();
  const [showDrawer, setShowDrawer] = useState(false);

  // The site header is exactly 64px tall on mobile (py-2.5 + min-h-11 = 10+44+10=64).
  // We use this for the sticky offset and spacer so it sits flush.

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";

  const [filters, setFilters] = useState<TFilters>({
    ...initialFilters,
    ...(adapter.filtersFromParams(searchParams) as TFilters),
  });

  // Snapshot the mount-time key once. initialData/initialDataUpdatedAt must
  // only seed the query for that exact key: passing them on every render
  // (with Date.now()) re-seeds EVERY new filter key with stale mount data
  // marked fresh, which silently suppresses all client-side refetches.
  const [mountSnapshot] = useState(() => ({
    key: JSON.stringify([
      pathname,
      { ...initialFilters, ...(adapter.filtersFromParams(searchParams) as TFilters) },
      searchParams.get("sort") || "",
      Number(searchParams.get("page")) || 1,
    ]),
    time: Date.now(),
  }));
  const isSeedKey =
    JSON.stringify([pathname, filters, sort, page]) === mountSnapshot.key;

  const queryKey = ["listings", pathname, filters, sort, page] as const;
  const {
    data,
    error: queryError,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => adapter.fetchItems({ filters, sort, page }),
    initialData: isSeedKey ? (initialData ?? undefined) : undefined,
    initialDataUpdatedAt: isSeedKey && initialData ? mountSnapshot.time : undefined,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
  const loading = isLoading && !data;
  // Background refetch with previous results on screen (filter/sort/page
  // change): dim the stale cards and show a lightweight skeleton instead of
  // swapping everything in suddenly.
  const refreshing = isFetching && !isLoading && !!data?.items?.length;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load listings"
    : null;

  // Prefetch the next page in the background for instant "Next" navigation.
  useEffect(() => {
    if (!data) return;
    const totalPages = Math.ceil(data.total / data.limit);
    if (page >= totalPages) return;
    queryClient.prefetchQuery({
      queryKey: ["listings", pathname, filters, sort, page + 1],
      queryFn: () => adapter.fetchItems({ filters, sort, page: page + 1 }),
      staleTime: 60 * 1000,
    });
  }, [queryClient, adapter, pathname, filters, sort, page, data]);

  // Smooth-scroll the feed into view on page change.
  const feedRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(page);
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  // Close drawer when viewport reaches xl
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setShowDrawer(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  const handleFilterChange = (newFilters: TFilters) => {
    setFilters(newFilters);
    router.push(
      adapter.syncUrl({ filters: newFilters, sort, pathname, searchParams })
    );
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set("sort", newSort);
    else params.delete("sort");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const pageTitle = adapter.buildTitle(filters);
  const breadcrumbItems = adapter.buildBreadcrumbs(filters);
  const activeFilterCount = countActiveFilters(filters);
  const filtersAsRecord = filters as Record<string, string>;

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const pageHref = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Compact window: first, last, current ±1, ellipsis elsewhere.
  const pageNumbers: (number | "…")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const keep = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
    const out: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (!keep.has(i)) {
        if (out[out.length - 1] !== "…") out.push("…");
        continue;
      }
      out.push(i);
    }
    return out;
  })();

  return (
    <div className="min-h-screen! bg-[#f6f7f9]!">
      {/* Header spacer */}
      <div className="h-[54px]!" aria-hidden="true" />

      {/* ── Mobile filter bar ── */}
      <MobileFilterBar
        locationLabel={getLocationLabel(filtersAsRecord)}
        priceLabel={getPriceLabel(filtersAsRecord)}
        bedsLabel={getBedsLabel(filtersAsRecord)}
        typeLabel={getTypeLabel(filtersAsRecord)}
        activeFilterCount={activeFilterCount}
        onOpenDrawer={() => setShowDrawer(true)}
        sort={sort}
        sortOptions={adapter.sortOptions}
      />

      {/* ── Mobile drawer ── */}
      {showDrawer && (
          <div className="fixed! inset-0! z-50! lg:hidden!">
          {/* overlay */}
          <div
            className="absolute! inset-0! bg-black/40! backdrop-blur-sm!"
            onClick={() => setShowDrawer(false)}
          />
          {/* panel */}
          <div className="absolute! bottom-0! left-0! right-0! bg-white! rounded-t-2xl! max-h-[90vh]! flex! flex-col! overflow-hidden!">
            {/* drag handle */}
            <div className="flex! justify-center! pt-3! pb-1! shrink-0!">
              <div className="w-10! h-1! bg-gray-200! rounded-full!" />
            </div>
            {/* header */}
            <div className="flex! items-center! justify-between! px-5! py-3! border-b! border-gray-100! shrink-0!">
              <h2 className="font-['Lexend',sans-serif]! text-base! font-bold! text-gray-900!">
                Filters
              </h2>
              <div className="flex! items-center! gap-4!">
                <button
                  onClick={() => {
                    handleFilterChange(adapter.resetFilters);
                    setShowDrawer(false);
                  }}
                  className="text-xs! font-bold! text-[#27427f]! uppercase! tracking-wider! cursor-pointer!"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1! rounded-lg! hover:bg-gray-100! transition-colors! cursor-pointer!"
                >
                  <X className="w-5! h-5! text-gray-500!" />
                </button>
              </div>
            </div>
            {/* scrollable filter body */}
            <div className="flex-1! overflow-y-auto! px-4! py-4!">
              {/* Sort */}
              <div className="mb-4!">
                <div className="text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-2!">
                  Sort By
                </div>
                <div className="flex! flex-wrap! gap-1.5!">
                  {adapter.sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`px-3! py-1.5! rounded-lg! border! text-[12px]! font-medium! transition-all! cursor-pointer! ${
                        sort === opt.value
                          ? "bg-[#27427f]! text-white! border-[#27427f]!"
                          : "bg-white! text-gray-500! border-gray-200!"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {adapter.renderFilters({
                values: filters,
                onChange: handleFilterChange,
                onReset: () => handleFilterChange(adapter.resetFilters),
              })}
            </div>
            {/* sticky footer */}
            <div className="shrink-0! px-4! py-4! border-t! border-gray-100! bg-white!">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full! py-3! rounded-xl! bg-[#27427f]! text-white! text-sm! font-bold! cursor-pointer! hover:bg-[#1a2d59]! transition-colors!"
              >
                Show {data?.total ?? 0} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ── */}
      <div className="max-w-[1250px]! mx-auto! px-4! sm:px-6! lg:px-8! pt-0! pb-16!">
        <div className="flex! gap-6! items-start!">

          {/* ── Sidebar (xl+) ── */}
          <aside className="hidden! lg:flex! lg:flex-col! lg:gap-4! w-[280px]! shrink-0! sticky! top-[62px]! max-h-[calc(100vh-62px)]! overflow-y-auto! pt-4! pb-6! pr-1!">
            {adapter.renderFilters({
              values: filters,
              onChange: handleFilterChange,
              onReset: () => handleFilterChange(adapter.resetFilters),
            })}
            {adapter.renderActiveChips(filters, handleFilterChange)}
            <div className="h-[240px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-100! shrink-0!">
              <LocalityMap
                city={adapter.mapCity(filters)}
                locality={adapter.mapLocality?.(filters)}
              />
            </div>
          </aside>

          {/* ── Main column ── */}
          <main className="flex-1! min-w-0! flex! flex-col! pt-3! lg:pt-3!">

            {/* Sticky row: breadcrumbs + sort only */}
            <div className="lg:sticky! lg:top-[64px]! z-20! bg-[#f6f7f9]! border-b! border-gray-200/60! py-1! mb-3! -mx-4! lg:mx-0! px-4! lg:px-0!">
              <div className="flex! flex-row! items-center! justify-between! gap-3!">
                <div className="flex-1! min-w-0!">
                  <Breadcrumbs items={breadcrumbItems} jsonLd />
                </div>
                <div className="relative! shrink-0! w-[180px]! hidden! lg:block!">
                  <CustomSelect
                    value={sort}
                    options={adapter.sortOptions.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    onChange={(v) => handleSortChange(v)}
                    ariaLabel="Sort listings"
                    trailingIcon={
                      <ArrowUpDown className="w-3.5! h-3.5! text-[#27427f]!" />
                    }
                    buttonClassName="font-['Manrope',sans-serif]! bg-[#eef2f7]! border-transparent! rounded-full! pl-4! py-2.5! font-semibold! text-[#27427f]! hover:bg-[#dde5f0]! focus:bg-white! focus:border-[#27427f]/30!"
                  />
                </div>
              </div>
            </div>

            {/* Title (scrolls away) */}
            <div className="min-w-0! mt-0! mb-4!">
              <h1 className="font-['Manrope',sans-serif]! text-lg! sm:text-2xl! font-medium! text-gray-900! leading-snug! capitalize! truncate!">
                <span className="text-gray-900! text-lg! font-['Manrope',sans-serif] font-normal!">
                  {data?.total ?? 0} properties
                </span>{" "}
                <span className="font-light! text-gray-300!">|</span>{" "}
                {pageTitle}
              </h1>
            </div>

            {/* Active chips on mobile */}
            <div className="lg:hidden! mb-4!">
              {adapter.renderActiveChips(filters, handleFilterChange)}
            </div>

            {/* Cards + right rail side-by-side at 2xl */}
            <div className="flex! gap-6! items-start!">
              {/* ── Card feed ── */}
              <div ref={feedRef} className="flex-1! min-w-0! scroll-mt-[130px]!">
                {/* ── Lightweight skeleton during background refetches ── */}
                {refreshing && (
                  <div className="mb-3! flex! flex-col! gap-2!" aria-hidden="true">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="flex! items-center! gap-3! bg-white! rounded-xl! border! border-gray-100! p-3!"
                      >
                        <div className={`w-14! h-14! rounded-lg! bg-gray-200! shrink-0! shimmer! ${SHIMMER_DELAYS[i % SHIMMER_DELAYS.length]}`} />
                        <div className="flex-1! min-w-0! flex! flex-col! gap-2!">
                          <div className={`h-2.5! rounded! bg-gray-200! w-2/3! shimmer! ${SHIMMER_DELAYS[i % SHIMMER_DELAYS.length]}`} />
                          <div className="h-2.5! rounded! bg-gray-100! w-1/3!" />
                        </div>
                        <div className="w-16! h-7! rounded-lg! bg-gray-100! shrink-0!" />
                      </div>
                    ))}
                  </div>
                )}
                {/* ── Cards / states ── */}
                {loading ? (
                  <div className="flex! flex-col! gap-3!">
                    {[1, 2, 3, 4].map((i) => (
                      <CardSkeleton key={i} index={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-white! border! border-red-100! rounded-2xl! p-10! text-center!">
                    <p className="text-red-500! font-semibold! mb-4!">{error}</p>
                    <button
                      onClick={() => refetch()}
                      className="px-5! py-2! bg-red-50! text-red-600! rounded-lg! text-sm! font-bold! hover:bg-red-100! transition-colors! cursor-pointer!"
                    >
                      Try Again
                    </button>
                  </div>
                ) : data?.items.length === 0 ? (
                  <div className="bg-white! rounded-2xl! border! border-gray-100! p-16! text-center! flex! flex-col! items-center!">
                    <div className="w-20! h-20! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-5!">
                      <Search className="w-8! h-8! text-gray-300!" />
                    </div>
                    <h3 className="font-['Lexend',sans-serif]! text-xl! font-bold! text-gray-900! mb-2!">
                      {adapter.emptyTitle}
                    </h3>
                    <p className="text-gray-500! text-sm! max-w-sm! mb-6!">
                      {adapter.emptyHint(filters)}
                    </p>
                    <button
                      onClick={() => handleFilterChange(adapter.resetFilters)}
                      className="px-6! py-2.5! bg-[#27427f]! text-white! rounded-xl! font-bold! text-sm! hover:bg-[#1a2d59]! transition-colors! cursor-pointer!"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={refreshing ? "flex! flex-col! gap-3! opacity-40! pointer-events-none! select-none! transition-opacity! duration-300!" : "flex! flex-col! gap-3! transition-opacity! duration-300!"}>
                      {data?.items.map((item) => adapter.renderCard(item))}
                    </div>

                    {/* Pagination */}
                    {data && (
                      <div className="font-['Manrope',sans-serif]! mt-8! pt-6! border-t! border-gray-200/60! flex! flex-col! items-center! gap-3.5!">
                        <p className="text-[13px]! text-gray-500! tabular-nums!">
                          Showing{" "}
                          <span className="font-semibold! text-gray-900!">
                            {data.total === 0
                              ? 0
                              : `${(page - 1) * (data.limit || 12) + 1}–${Math.min(page * (data.limit || 12), data.total)}`}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold! text-gray-900!">
                            {data.total}
                          </span>{" "}
                          properties
                        </p>
                      <nav
                        aria-label="Listing pages"
                        className="flex! flex-wrap! items-center! justify-center! gap-1!"
                      >
                        {page > 1 ? (
                          <Link
                            href={pageHref(page - 1)}
                            prefetch
                            scroll={false}
                            aria-label="Previous page"
                            className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            <ChevronLeft className="w-4! h-4!" />
                            <span className="hidden! sm:inline!">Previous</span>
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-300! cursor-default!">
                            <ChevronLeft className="w-4! h-4!" />
                            <span className="hidden! sm:inline!">Previous</span>
                          </span>
                        )}
                        {pageNumbers.map((p, i) =>
                          p === "…" ? (
                            <span key={`e${i}`} className="w-9! text-center! text-sm! text-gray-400!">
                              …
                            </span>
                          ) : p === page ? (
                            <span
                              key={p}
                              aria-current="page"
                              className="w-9! h-9! flex! items-center! justify-center! rounded-lg! text-[13px]! font-bold! text-white! bg-[#27427f]! tabular-nums!"
                            >
                              {p}
                            </span>
                          ) : (
                            <Link
                              key={p}
                              href={pageHref(p)}
                              prefetch
                              scroll={false}
                              aria-label={`Page ${p}`}
                              className="w-9! h-9! flex! items-center! justify-center! rounded-lg! text-[13px]! font-medium! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline! tabular-nums!"
                            >
                              {p}
                            </Link>
                          )
                        )}
                        {page < totalPages ? (
                          <Link
                            href={pageHref(page + 1)}
                            prefetch
                            scroll={false}
                            aria-label="Next page"
                            className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            <span className="hidden! sm:inline!">Next</span>
                            <ChevronRight className="w-4! h-4!" />
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-300! cursor-default!">
                            <span className="hidden! sm:inline!">Next</span>
                            <ChevronRight className="w-4! h-4!" />
                          </span>
                        )}
                      </nav>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Right rail (xl+) — reserved for adapter overrides ── */}
              {adapter.renderRightRail && (
                <aside className="hidden! xl:block! w-[260px]! shrink-0! self-start! sticky! top-[152px]! max-h-[calc(100vh-152px)]! overflow-y-auto! pb-6! z-10!">
                  {adapter.renderRightRail(filters, data?.items as any)}
                </aside>
              )}

            </div>
          </main>
        </div>
      </div>
      <WhatsAppPopup
        pageUrl={pathname}
        listingType={(filters as Record<string, string>).listingType ?? ""}
        propertyType={(filters as Record<string, string>).propertyType ?? ""}
        location={(filters as Record<string, string>).location ?? ""}
      />
    </div>
  );
}
