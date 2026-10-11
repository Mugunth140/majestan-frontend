import Link from "next/link";
import { Sofa } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { Card, EmptyState, TEXT_LINK } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import { AMENITY_GRID, AmenityTile } from "@/components/site/project/overview/amenity-parts";

type FurnishingItem = { key: string; name: string; icon?: string };

/**
 * Furnishing is recorded per unit, so the overview shows the union across all
 * units. When the units differ, a note says so: otherwise a buyer reads the
 * list as a promise for every flat.
 */
export function FurnishingSection({ project }: { project: ProjectDetail }) {
  const itemsByKey = new Map<string, FurnishingItem>();

  // Per-unit key sets, kept to compare against the union below.
  const unitKeySets = (project.units ?? []).map((unit) => {
    const keys = new Set<string>();
    for (const link of unit.furnishingItems ?? []) {
      const item = link.furnishingItem;
      const name = item?.name?.trim();
      if (!item || !name) continue;

      const key = item.id != null ? `id:${item.id}` : `name:${name.toLowerCase()}`;
      keys.add(key);
      if (!itemsByKey.has(key)) itemsByKey.set(key, { key, name, icon: item.icon });
    }
    return keys;
  });

  const items = [...itemsByKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (items.length === 0) {
    return (
      <Card title="Furnished items" id="furnishing">
        <EmptyState
          icon={Sofa}
          title="Furnishing details aren't listed yet"
          body="Ask what comes fitted in each unit, from wardrobes to the kitchen."
          action={
            <RequestButton
              label="Ask about furnishing"
              message={`What furnishing comes with the units at ${project.name}?`}
            />
          }
        />
      </Card>
    );
  }

  // Each unit's set is a subset of the union, so a smaller size means it differs.
  const varies = unitKeySets.some((keys) => keys.size !== itemsByKey.size);

  return (
    <Card title="Furnished items" id="furnishing">
      <div className={`${AMENITY_GRID} mt-6!`}>
        {items.map((item) => (
          <AmenityTile
            key={item.key}
            name={item.name}
            Icon={item.icon ? connectivityIconFor(item.icon) : Sofa}
          />
        ))}
      </div>
      {varies && (
        <p className="text-sm! text-gray-500! mt-4!">
          Furnishing varies by unit.{" "}
          <Link href={`/${project.canonicalSlug}/floor-plans`} className={TEXT_LINK}>
            See each configuration
          </Link>{" "}
          for its list.
        </p>
      )}
    </Card>
  );
}
