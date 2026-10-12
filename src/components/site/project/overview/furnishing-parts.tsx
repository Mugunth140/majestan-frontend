import {
  AirVent,
  Archive,
  Armchair,
  Bath,
  BedDouble,
  BedSingle,
  BookOpen,
  Coffee,
  CookingPot,
  DoorOpen,
  Fan,
  Heater,
  Lamp,
  LampDesk,
  LampFloor,
  Microwave,
  Package,
  Printer,
  Projector,
  Refrigerator,
  Shirt,
  ShowerHead,
  Snowflake,
  Sofa,
  Speaker,
  Thermometer,
  TreePine,
  Tv,
  UtensilsCrossed,
  Vault,
  WashingMachine,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  groupUnitsByConfiguration,
  hasFurnishing,
  titleCase,
  unitFurnishingItems,
} from "@/lib/project-overview";

/*
 * Furnishing rows shared by the overview card and the amenities sub-page.
 * The CRM records furnishing per unit, so everything here is derived from the
 * units: the union of their items, and which configurations carry each one.
 * Server-safe: no hooks.
 */

/**
 * The CRM's furnishing icon shortlist, stored as lucide PascalCase names.
 * Must stay in sync with crm-frontend/src/components/shared/furnishing-icons.tsx.
 */
const ICONS: Record<string, LucideIcon> = {
  Sofa,
  Armchair,
  BedDouble,
  BedSingle,
  Tv,
  Refrigerator,
  WashingMachine,
  Microwave,
  CookingPot,
  Coffee,
  Lamp,
  LampDesk,
  LampFloor,
  Fan,
  AirVent,
  Heater,
  Snowflake,
  ShowerHead,
  Bath,
  DoorOpen,
  Archive,
  Package,
  Vault,
  Shirt,
  BookOpen,
  UtensilsCrossed,
  Wind,
  Thermometer,
  Projector,
  Speaker,
  Printer,
  TreePine,
};

/* For items saved without an icon, or with one outside the shortlist. */
const BY_NAME: [RegExp, LucideIcon][] = [
  [/\b(ac|air ?condition\w*)\b/i, Snowflake],
  [/wardrobe|cupboard|storage/i, Archive],
  [/bed/i, BedDouble],
  [/sofa|couch/i, Sofa],
  [/chair/i, Armchair],
  [/fridge|refrigerator/i, Refrigerator],
  [/washing|washer/i, WashingMachine],
  [/microwave|oven/i, Microwave],
  [/kitchen|chimney|hob|stove|cooktop/i, CookingPot],
  [/dining|table/i, UtensilsCrossed],
  [/\btv\b|television/i, Tv],
  [/geyser|water heater/i, Thermometer],
  [/fan/i, Fan],
  [/light|lamp/i, Lamp],
  [/shower/i, ShowerHead],
  [/bath|tub/i, Bath],
  [/curtain|blind/i, Wind],
  [/door/i, DoorOpen],
];

export function furnishingIconFor(icon: string | null | undefined, name: string): LucideIcon {
  if (icon && ICONS[icon]) return ICONS[icon];
  return BY_NAME.find(([pattern]) => pattern.test(name))?.[1] ?? Sofa;
}

export type FurnishingItem = {
  key: string;
  name: string;
  Icon: LucideIcon;
  /** Labels of the configurations with at least one unit carrying the item. */
  configurations: string[];
};

export type FurnishingConfiguration = {
  key: string;
  /** "2 BHK", or the unit's title when it has no bedroom count. */
  label: string;
  /** "Semi Furnished", or "Semi Furnished or Fully Furnished" when units differ. */
  status: string | null;
};

export type Furnishing = {
  items: FurnishingItem[];
  configurations: FurnishingConfiguration[];
  /** True when the units do not all carry the same items. */
  varies: boolean;
  /** The one status every configuration shares, or null when they differ. */
  sharedStatus: string | null;
};

/**
 * The project's furnishing, as a buyer asks about it: what comes fitted, and
 * in which configurations. Null for plots, which have none to record.
 */
export function projectFurnishing(project: ProjectDetail): Furnishing | null {
  if (!hasFurnishing(project.projectType)) return null;

  const items = new Map<string, Omit<FurnishingItem, "configurations"> & { in: Set<string> }>();
  const unitKeySets: Set<string>[] = [];
  const configurations: FurnishingConfiguration[] = [];

  const groups = project.units?.length ? groupUnitsByConfiguration(project) : [];
  for (const group of groups) {
    const statuses = new Set<string>();

    for (const unit of group.units) {
      if (unit.furnishedStatus) statuses.add(titleCase(unit.furnishedStatus));

      const keys = new Set<string>();
      for (const item of unitFurnishingItems(unit)) {
        const name = item.name;
        const key = item.id != null ? `id:${item.id}` : `name:${name.toLowerCase()}`;
        keys.add(key);
        const row = items.get(key) ?? {
          key,
          name,
          Icon: furnishingIconFor(item.icon, name),
          in: new Set<string>(),
        };
        row.in.add(group.label);
        items.set(key, row);
      }
      unitKeySets.push(keys);
    }

    configurations.push({
      key: group.key,
      label: group.label,
      status: statuses.size > 0 ? [...statuses].join(" or ") : null,
    });
  }

  // Configuration order, so "2 BHK, 3 BHK" never reads "3 BHK, 2 BHK".
  const order = configurations.map((c) => c.label);
  const rows = [...items.values()]
    .map(({ in: labels, ...row }) => ({
      ...row,
      configurations: order.filter((label) => labels.has(label)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const statuses = new Set(configurations.map((c) => c.status));

  return {
    items: rows,
    configurations,
    // Each unit's set is a subset of the union, so a smaller one differs.
    varies: unitKeySets.some((keys) => keys.size !== items.size),
    sharedStatus: statuses.size === 1 ? [...statuses][0] : null,
  };
}

/** "2 BHK, 3 BHK", or "All configurations" when every one carries it. */
export function configurationNote(item: FurnishingItem, furnishing: Furnishing): string {
  if (item.configurations.length === furnishing.configurations.length) {
    return "All configurations";
  }
  return item.configurations.join(", ");
}

/**
 * The furnishing state as pills: one when every configuration agrees,
 * otherwise one per configuration the CRM gave a state.
 */
export function FurnishingStatus({ furnishing }: { furnishing: Furnishing }) {
  const { configurations, sharedStatus } = furnishing;
  const rows: { key: string; label: string; status: string }[] = sharedStatus
    ? [
        {
          key: "all",
          label: configurations.length > 1 ? "All configurations" : configurations[0].label,
          status: sharedStatus,
        },
      ]
    : configurations.flatMap((c) => (c.status ? [{ key: c.key, label: c.label, status: c.status }] : []));

  if (rows.length === 0) return null;

  return (
    <dl className="mt-4! mb-0! flex! flex-wrap! gap-2!">
      {rows.map((row) => (
        <div
          key={row.key}
          className="inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]/5! px-3! py-1! text-sm!"
        >
          <dt className="font-normal! text-gray-600!">{row.label}</dt>
          <dd className="mb-0! font-medium! text-[#27427f]!">{row.status}</dd>
        </div>
      ))}
    </dl>
  );
}
