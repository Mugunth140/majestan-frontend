import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./overview.module.css";

/**
 * Building blocks for the overview's sections. The sub-pages keep the plain
 * cards in project-ui; the overview has its own colour and surfaces.
 *
 * One rule runs through all of it: a section is one surface. Content inside
 * sits on that surface — rows divided by hairlines, icons on tinted squares —
 * never in a bordered box of its own, so nothing reads as a section inside a
 * section.
 */

export const OV_ROOT = styles.root;

/* Token-backed colour utilities, so the components never hardcode a hex. */
export const INK = "text-[var(--ov-ink)]!";
export const BODY_TEXT = "text-[var(--ov-body)]!";
export const MUTED = "text-[var(--ov-muted)]!";
export const BLUE = "text-[var(--ov-blue)]!";
export const HAIRLINE = "border-[var(--ov-line)]!";

/** Small uppercase label above a value. */
export const EYEBROW = "text-[11px]! font-semibold! uppercase! tracking-[0.08em]! text-[var(--ov-muted)]!";
/** A section heading's type, for a second heading inside one section. */
export const SECTION_HEADING = "m-0! text-xl! md:text-2xl! font-semibold! tracking-[-0.025em]! leading-tight! text-balance! text-[var(--ov-ink)]!";
export const PROSE = "text-[15px]! md:text-base! leading-[1.7]! text-[var(--ov-body)]! text-pretty!";

export const FOCUS_RING =
  "focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[var(--ov-ink)]! focus-visible:ring-offset-2!";

/** Text button for "Show more" toggles. */
export const TOGGLE =
  `inline-flex! cursor-pointer! items-center! gap-1.5! border-0! bg-transparent! p-0! text-sm! font-semibold! text-[var(--ov-ink)]! underline! decoration-[var(--ov-line-strong)]! decoration-1! underline-offset-4! rounded-sm! transition-[text-decoration-color]! duration-150! hover:decoration-[var(--ov-ink)]! ${FOCUS_RING}`;

/**
 * A segmented choice: plan picks, categories, nearby tabs. The selected
 * one takes a soft blue fill, so every picker on the page is the same
 * gesture without a block of black in each section.
 */
export function chipClass(active: boolean) {
  return `inline-flex! shrink-0! items-center! gap-2! rounded-full! px-3.5! py-1.5! text-sm! font-medium! whitespace-nowrap! cursor-pointer! border! transition-[background-color,border-color,color,transform]! duration-150! ease-out-quint! active:scale-[0.97]! ${FOCUS_RING} ${
    active
      ? "border-[#bcd0f7]! bg-[var(--ov-sky)]! text-[var(--ov-blue-deep)]!"
      : "border-[var(--ov-line-strong)]! bg-white! text-[var(--ov-ink-2)]! hover:border-[#bcd0f7]! hover:text-[var(--ov-blue-deep)]!"
  }`;
}

/**
 * One overview section. `meta` is a short line under the heading carrying the
 * section's headline number ("4 configurations · ₹90 L – 6 Cr"), so a reader
 * skimming headings still picks up the facts.
 */
export function Panel({
  id,
  title,
  meta,
  action,
  tone = "light",
  tint = false,
  children,
}: {
  id: string;
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "light" | "ink";
  /** The pale blue gradient surface. Used sparingly, so it reads as emphasis. */
  tint?: boolean;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  const dark = tone === "ink";
  // Keeps the old prop compiling; "ink" is no longer used on the overview.
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.panel} ${dark ? styles.ink : ""} ${tint ? styles.tint : ""} ${styles.reveal}`}
    >
      <div className="flex! flex-wrap! items-center! justify-between! gap-x-6! gap-y-3!">
        <div className="min-w-0!">
          <h2
            id={headingId}
            className={`m-0! text-xl! md:text-2xl! font-semibold! tracking-[-0.025em]! leading-tight! text-balance! ${
              dark ? "text-white!" : INK
            }`}
          >
            {title}
          </h2>
          {meta && (
            <p className={`mt-1.5! mb-0! text-sm! tabular-nums! ${dark ? "text-white/65!" : MUTED}`}>
              {meta}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The way from a preview to its sub-page: a plain text link with an arrow,
 * underlined on hover. Quiet enough to sit beside every heading.
 */
export function PanelLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "light" | "ink";
}) {
  return (
    <Link
      href={href}
      className={`group/plink shrink-0! inline-flex! items-center! gap-1.5! rounded-sm! text-sm! font-semibold! text-[var(--ov-ink)]! no-underline! ${FOCUS_RING}`}
    >
      <span className="underline! decoration-transparent! decoration-1! underline-offset-4! transition-[text-decoration-color]! duration-150! group-hover/plink:decoration-[var(--ov-ink)]!">
        {children}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="w-4! h-4! transition-transform! duration-150! ease-out-quint! group-hover/plink:translate-x-0.5!"
      />
    </Link>
  );
}

/** An icon on a pale blue square: the one icon treatment on the page. */
export function IconMark({
  Icon,
  size = "md",
}: {
  Icon: React.ElementType;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid! shrink-0! place-items-center! bg-[linear-gradient(145deg,#f3f7ff,#e1ebff)]! ${
        size === "sm" ? "w-8! h-8! rounded-lg!" : "w-11! h-11! rounded-xl!"
      }`}
    >
      <Icon className={`${size === "sm" ? "w-4! h-4!" : "w-5! h-5!"} ${BLUE}`} strokeWidth={1.75} />
    </span>
  );
}

/**
 * What a section shows when the CRM has nothing for it yet: one sentence and
 * one action, straight on the section's surface.
 */
export function PanelEmpty({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ElementType;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-6! flex! flex-col! gap-4! sm:flex-row! sm:items-center!">
      <div className="flex! items-start! gap-4! min-w-0! flex-1!">
        <IconMark Icon={icon} />
        <div className="min-w-0!">
          <p className={`m-0! text-[15px]! font-semibold! ${INK}`}>{title}</p>
          {body && <p className={`mt-0.5! mb-0! text-sm! text-pretty! ${MUTED}`}>{body}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** "Sold out" or "2 available", with a dot a buyer can scan down a column. */
export function Availability({ count }: { count: number }) {
  return (
    <span className={`inline-flex! items-center! gap-1.5! text-[13px]! whitespace-nowrap! ${count > 0 ? "text-emerald-700!" : MUTED}`}>
      <span
        aria-hidden="true"
        className={`w-1.5! h-1.5! rounded-full! ${count > 0 ? "bg-emerald-500!" : "bg-gray-300!"}`}
      />
      {count > 0 ? `${count} available` : "Sold out"}
    </span>
  );
}

export const swapClass = styles.swap;
export const collapseClass = styles.collapse;
export const barClass = styles.bar;
