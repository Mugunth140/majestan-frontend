import type { SeoProperty, SeoPropertyFurnishing } from "./api/property-by-slug";

export type PropertyFurnishingItem = { key: string; name: string; icon?: string | null };

/** Selected CRM items only. A furnishing status never implies an item list. */
export function getPropertyFurnishingItems(property: SeoProperty): PropertyFurnishingItem[] {
  if (property.propertyType === "plot" || property.propertyType === "farmland") return [];
  const raw = property as SeoProperty & { __propertyFurnishings__?: SeoPropertyFurnishing[] };
  const joins = property.furnishings?.length
    ? property.furnishings
    : property.propertyFurnishings ?? raw.__propertyFurnishings__ ?? [];
  const seen = new Set<string>();
  return joins.flatMap(({ furnishingItem: item }) => {
    if (!item) return [];
    const name = item.name.trim();
    if (!name || seen.has(name.toLowerCase())) return [];
    seen.add(name.toLowerCase());
    return [{ key: item.id != null ? `id:${item.id}` : name.toLowerCase(), name, icon: item.icon }];
  });
}
