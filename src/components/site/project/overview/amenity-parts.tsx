import type { ProjectDetail } from "@/lib/api/projects";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import { getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";

/*
 * Amenity rows shared by the overview preview and the amenities sub-page.
 * Server-safe: no hooks.
 */

export type AmenityItem = {
  key: string;
  name: string;
  Icon: React.ElementType;
  /** Raw CRM category, e.g. "security". The sub-page formats it for display. */
  category: string | null;
};

/**
 * Flat, deduped list of the project's amenities. Dedupes on the name a buyer
 * reads, not the id, so one amenity never appears twice.
 */
export function amenityList(project: ProjectDetail): AmenityItem[] {
  const seen = new Set<string>();
  const out: AmenityItem[] = [];

  for (const link of project.projectAmenities ?? []) {
    const amenity = link.amenity;
    const name = amenity?.name?.trim();
    if (!amenity || !name) continue;

    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // The API sends iconKey, which the shared type does not declare yet.
    const iconKey =
      (amenity as typeof amenity & { iconKey?: string | null }).iconKey ?? amenity.icon;

    out.push({
      key: `${amenity.id}`,
      name,
      Icon: iconKey ? connectivityIconFor(iconKey) : getIconForAmenity(name),
      category: amenity.category ?? null,
    });
  }

  return out;
}

/**
 * A soft filled tile: icon in a white chip, name beneath. Filled rather than
 * outlined, so a grid of them reads as a set of features, not a form to fill.
 * Shared by amenities and furnished items; `note` qualifies the name, such as
 * which configurations a furnished item comes with.
 */
export function AmenityTile({
  name,
  Icon,
  note,
}: {
  name: string;
  Icon: React.ElementType;
  note?: string;
}) {
  return (
    <div className="flex! flex-col! items-start! gap-3! rounded-2xl! bg-gray-50! p-4! min-w-0! h-full!">
      <span
        aria-hidden="true"
        className="w-10! h-10! rounded-xl! bg-white! ring-1! ring-gray-200/80! grid! place-items-center! shrink-0!"
      >
        <Icon className="w-5! h-5! text-[#27427f]!" strokeWidth={1.75} />
      </span>
      <span className="min-w-0! max-w-full!">
        <span className="block! text-sm! font-medium! text-gray-900! leading-snug! text-pretty! break-words!">
          {name}
        </span>
        {note && (
          <span className="block! mt-1! text-xs! text-gray-500! leading-snug! text-pretty!">
            {note}
          </span>
        )}
      </span>
    </div>
  );
}

/** The grid every amenity-like list uses, on the overview and the sub-page. */
export const AMENITY_GRID = "grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-3!";

/** A category chip: links a category name and its count to that group. */
export const CATEGORY_CHIP =
  "inline-flex! items-center! gap-1.5! rounded-full! bg-white! px-3! py-1! text-xs! font-medium! text-gray-700! ring-1! ring-gray-200! no-underline! transition-[color,box-shadow]! duration-150! ease-out-quint! hover:text-[#27427f]! hover:ring-[#27427f]/40! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!";

const OTHER = "Other";

/* The CRM's category enum holds singular and plural spellings of the same
   group; without these, "Utility" and "Utilities" render as two groups. */
const CATEGORY_ALIASES: Record<string, string> = {
  utility: "Utilities",
  utilities: "Utilities",
  feature: "Features",
};

/** "security" becomes "Security", and "multi_purpose" becomes "Multi Purpose". */
export function categoryTitle(raw: string | null): string {
  const alias = CATEGORY_ALIASES[(raw ?? "").trim().toLowerCase()];
  if (alias) return alias;
  const words = (raw ?? "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return OTHER;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/** The sub-page anchor for a category, so the overview's chips land on it. */
export function categoryAnchor(title: string): string {
  return `amenities-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Amenities grouped by CRM category: alphabetical, with "Other" last so the
 * catch-all never leads.
 */
export function amenityGroups(items: AmenityItem[]): [string, AmenityItem[]][] {
  const groups = new Map<string, AmenityItem[]>();
  for (const item of items) {
    const title = categoryTitle(item.category);
    groups.set(title, [...(groups.get(title) ?? []), item]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === OTHER) return 1;
    if (b === OTHER) return -1;
    return a.localeCompare(b);
  });
}
