// site/majestan-frontend/src/components/site/home/facing-arrow.tsx
import { ArrowUp } from "lucide-react";

const DIRECTIONS: Array<{ degrees: number; label: string; keys: string[] }> = [
  { degrees: 0, label: "North", keys: ["north", "n"] },
  { degrees: 45, label: "North-East", keys: ["northeast", "north_east", "north-east", "ne"] },
  { degrees: 90, label: "East", keys: ["east", "e"] },
  { degrees: 135, label: "South-East", keys: ["southeast", "south_east", "south-east", "se"] },
  { degrees: 180, label: "South", keys: ["south", "s"] },
  { degrees: 225, label: "South-West", keys: ["southwest", "south_west", "south-west", "sw"] },
  { degrees: 270, label: "West", keys: ["west", "w"] },
  { degrees: 315, label: "North-West", keys: ["northwest", "north_west", "north-west", "nw"] },
];

export function normalizeFacing(value: string | null | undefined): { degrees: number; label: string } | null {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!key) return null;
  const hit = DIRECTIONS.find((d) => d.keys.includes(key));
  return hit ? { degrees: hit.degrees, label: hit.label } : null;
}

export function FacingArrow({ facing }: { facing: string | null | undefined }): React.JSX.Element {
  const fixed = normalizeFacing(facing);

  if (!fixed) {
    return (
      <span
        role="img"
        aria-label="Facing not specified"
        title="Facing not specified"
        data-testid="facing-compass"
        className="inline-flex! h-6! w-6! shrink-0! items-center! justify-center! rounded-full! border! border-gray-200! bg-gray-50!"
      >
        <span className="h-1.5! w-1.5! rounded-full! bg-gray-300!" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${fixed.label} facing`}
      title={fixed.label}
      data-testid="facing-compass"
      className="relative! inline-flex! h-6! w-6! shrink-0! items-center! justify-center! rounded-full! border! border-[#27427f]/25! bg-white!"
    >
      {/* Needle points from south to north, then rotates to the facing. */}
      <ArrowUp
        className="h-3.5! w-3.5! text-[#27427f]!"
        strokeWidth={2.5}
        aria-hidden="true"
        style={{ transform: `rotate(${fixed.degrees}deg)` }}
      />
    </span>
  );
}
