import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Shared building blocks for the project overview and its sub-pages.
 *
 * One file, so every section on every project page draws its card, heading,
 * label and "view all" link from the same place. The sub-pages used to set
 * their own radii, heading weights and fonts (one still hardcodes Lexend),
 * which is why they read as a different site from the overview.
 */

/** The page column every project page lays its content in. The overview's
    cover is the one thing that deliberately sits outside it. */
export const PAGE_CONTAINER = "max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!";

export const CARD =
  "bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! p-6! md:p-8!";
/* Matches FaqSection and LocalityTeaser, which these pages also render. A
   heavier heading here would make those two look like a different page. */
export const HEADING = "text-lg! md:text-xl! font-normal! text-gray-900!";
/* gray-400 fails 4.5:1 on white at this size; gray-500 clears it at 4.6:1. */
export const LABEL = "text-xs! font-medium! uppercase! tracking-wide! text-gray-500!";
export const VALUE = "text-sm! font-semibold! text-gray-900!";
export const BODY = "text-base! text-gray-600! leading-relaxed!";
/** Inline text link in the brand colour, with a visible focus ring. */
export const TEXT_LINK =
  "text-[#27427f]! no-underline! rounded-md! transition-colors! duration-150! ease-out-quint! hover:text-[#1e3563]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!";

/** CRM free text arrives newline separated. Blank lines are paragraph breaks. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** Single newlines in a highlights field mean "list", not "paragraph". */
export function bulletLines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
}

/**
 * A titled section card. `id` doubles as the in-page anchor; `scroll-mt`
 * clears the sticky navbar and section tabs when it is jumped to.
 */
export function Card({
  title,
  action,
  id,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${CARD} scroll-mt-32! min-w-0!`}
    >
      <div className="flex! items-center! justify-between! gap-4!">
        <h2 id={headingId} className={HEADING}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Full-bleed hairline, so dividers never read as a half-bordered block. */
export function Divider() {
  return <div className="my-6! h-px! bg-gray-200!" aria-hidden="true" />;
}

export function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base! font-semibold! text-gray-900!">{children}</h3>;
}

export function DefinitionGrid({
  rows,
  columns = 3,
}: {
  rows: { label: string; value: string }[];
  columns?: 2 | 3;
}) {
  return (
    <dl
      className={`grid! grid-cols-2! ${
        columns === 3 ? "sm:grid-cols-3!" : "sm:grid-cols-2!"
      } gap-x-6! gap-y-6!`}
    >
      {rows.map((row) => (
        <div key={row.label} className="min-w-0!">
          <dt className={LABEL}>{row.label}</dt>
          <dd className={`${VALUE} mt-1! break-words!`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The overview shows a preview; the sub-page holds the rest. Every preview
 * section ends in one of these so the way through is always the same
 * gesture in the same place. The arrow nudges on hover only — Tailwind v4's
 * `hover:` is already gated to pointers that can hover.
 */
export function ViewAllLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group/viewall shrink-0! inline-flex! items-center! gap-1.5! text-sm! font-medium! ${TEXT_LINK}`}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="w-4! h-4! transition-transform! duration-150! ease-out-quint! group-hover/viewall:translate-x-0.5!"
      />
    </Link>
  );
}

/**
 * What a section shows when the CRM has nothing for it yet. Every overview
 * section always renders — a buyer scanning for floor plans should find the
 * heading and learn they exist on request, not wonder whether they missed
 * them. One specific sentence and one action; never "to be updated".
 */
export function EmptyState({
  icon: Icon,
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
    <div className="mt-6! flex! flex-col! gap-4! rounded-2xl! bg-gray-50! ring-1! ring-gray-200/70! px-5! py-4! sm:flex-row! sm:items-center!">
      <div className="flex! items-start! gap-4! min-w-0! flex-1!">
        <span
          aria-hidden="true"
          className="w-10! h-10! shrink-0! rounded-xl! bg-white! ring-1! ring-gray-200! grid! place-items-center!"
        >
          <Icon className="w-5! h-5! text-gray-500!" strokeWidth={1.75} />
        </span>
        <div className="min-w-0!">
          <p className="text-sm! font-semibold! text-gray-900!">{title}</p>
          {body && <p className="mt-0.5! text-sm! text-gray-500! text-pretty!">{body}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
