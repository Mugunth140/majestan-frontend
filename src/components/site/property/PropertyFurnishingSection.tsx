import type { SeoProperty } from "@/lib/api/property-by-slug";
import { getPropertyFurnishingItems } from "@/lib/property-furnishing";
import { furnishingIconFor } from "@/components/site/project/overview/furnishing-parts";
import { Panel, PanelLink, IconMark } from "@/components/site/project/overview/overview-ui";

export function PropertyFurnishingSection({ property, preview = false }: { property: SeoProperty; preview?: boolean }) {
  const items = getPropertyFurnishingItems(property);
  if (!items.length) return null;
  const visible = preview ? items.slice(0, 6) : items;
  const count = `${items.length} furnishing ${items.length === 1 ? "item" : "items"}`;

  return (
    <Panel id={preview ? "furnishing-preview" : "furnishing"} title="Furnishing items"
      meta={visible.length < items.length ? `${visible.length} of ${count}` : count}
      action={preview ? <PanelLink href={`/${property.canonicalSlug}/amenities#furnishing`}>View all</PanelLink> : undefined}>
      <ul className="m-0! mt-6! pt-6! p-0! border-t! border-[#e2e9f4]! list-none! grid! grid-cols-2! md:grid-cols-3! gap-6!">
        {visible.map((item) => (
          <li key={item.key} className="flex! items-center! gap-3! min-w-0!">
            <IconMark Icon={furnishingIconFor(item.icon, item.name)} />
            <span className="text-sm! font-medium! text-[#1c2433]!">{item.name}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
