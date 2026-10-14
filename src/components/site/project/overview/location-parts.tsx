import type { ProjectDetail } from "@/lib/api/projects";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";

/*
 * Location rows shared by the overview preview and the locality sub-page.
 * Both pages must show the same facts, so the lists are built once here.
 * Nothing in this file uses hooks, so it renders on the server.
 */

export type ConnectivityItem = NonNullable<ProjectDetail["connectivity"]>[number];
export type NearbyCategory = NonNullable<ProjectDetail["nearbyCategories"]>[number];

/** A row with neither a label nor a detail has nothing to say, so it is dropped. */
export function visibleConnectivity(
  items: ConnectivityItem[] | null | undefined,
): ConnectivityItem[] {
  return (items ?? []).filter((c) => c.label || c.detail);
}

/**
 * Keeps only named places, trimmed. A category with no named place left is
 * dropped, so the overview never shows a heading over an empty list.
 */
export function visibleNearby(categories: NearbyCategory[] | null | undefined) {
  return (categories ?? [])
    .map((cat) => ({
      ...cat,
      places: (cat.places ?? []).flatMap((place) => {
        const name = place.name?.trim();
        return name ? [{ name, distance: place.distance }] : [];
      }),
    }))
    .filter((cat) => cat.places.length > 0);
}

/**
 * Icon in a soft navy tile. The tile carries the colour, not the glyph, so a
 * mix of CRM icons still reads as one set.
 */
export function IconTile({ Icon }: { Icon: React.ElementType }) {
  return (
    <div
      aria-hidden="true"
      className="w-10! h-10! rounded-lg! bg-[#1645bf]/5! grid! place-items-center! shrink-0!"
    >
      <Icon className="w-5! h-5! text-[#1645bf]!" strokeWidth={1.75} />
    </div>
  );
}

export function ConnectivityGrid({
  items,
  limit,
}: {
  items: ConnectivityItem[] | null | undefined;
  /** Overview shows the first few; the sub-page passes nothing and gets all. */
  limit?: number;
}) {
  const rows = visibleConnectivity(items);
  const shown = limit != null ? rows.slice(0, limit) : rows;
  if (shown.length === 0) return null;

  return (
    <div className="grid! grid-cols-1! sm:grid-cols-2! gap-3!">
      {shown.map((row, i) => (
        <div
          key={`${row.label ?? ""}-${row.detail ?? ""}-${i}`}
          className="flex! items-center! gap-3! rounded-xl! border! border-gray-200! px-4! py-3!"
        >
          <IconTile Icon={connectivityIconFor(row.icon)} />
          <div className="min-w-0!">
            {row.label && <p className="text-sm! font-semibold! text-gray-900!">{row.label}</p>}
            {row.detail && <p className="text-sm! text-gray-500!">{row.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NearbyPlaces({
  categories,
  maxCategories,
  placesPerCategory,
}: {
  categories: NearbyCategory[] | null | undefined;
  maxCategories?: number;
  placesPerCategory?: number;
}) {
  const groups = visibleNearby(categories);
  const shown = maxCategories != null ? groups.slice(0, maxCategories) : groups;
  if (shown.length === 0) return null;

  return (
    <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4!">
      {shown.map((cat, i) => {
        const Icon = connectivityIconFor(cat.icon);
        const places =
          placesPerCategory != null ? cat.places.slice(0, placesPerCategory) : cat.places;
        // Said out loud, so a cut-off list does not read as the complete one.
        const hidden = cat.places.length - places.length;

        return (
          <div key={`${cat.title ?? ""}-${i}`} className="rounded-xl! border! border-gray-200! p-4!">
            <div className="flex! items-center! gap-2!">
              <Icon className="w-4! h-4! text-[#1645bf]! shrink-0!" strokeWidth={1.75} />
              {cat.title && <p className="text-sm! font-semibold! text-gray-900!">{cat.title}</p>}
            </div>
            <ul className="mt-3! list-none! p-0!">
              {places.map((place, j) => (
                <li
                  key={`${place.name}-${j}`}
                  className={`flex! items-center! justify-between! gap-3! py-2!${
                    j > 0 ? " border-t! border-gray-100!" : ""
                  }`}
                >
                  <span className="min-w-0! text-sm! text-gray-700! truncate!" title={place.name}>
                    {place.name}
                  </span>
                  {place.distance && (
                    <span className="text-sm! text-gray-500! tabular-nums! shrink-0!">
                      {place.distance}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {hidden > 0 && <p className="mt-2! text-xs! text-gray-500!">+{hidden} more</p>}
          </div>
        );
      })}
    </div>
  );
}
