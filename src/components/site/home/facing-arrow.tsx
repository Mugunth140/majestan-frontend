// site/majestan-frontend/src/components/site/home/facing-arrow.tsx
import { ArrowUp } from "lucide-react";

type Direction = { degrees: number; label: string; abbr: string; keys: string[] };

const DIRECTIONS: Direction[] = [
  { degrees: 0, label: "North", abbr: "N", keys: ["north", "n"] },
  { degrees: 45, label: "North-East", abbr: "NE", keys: ["northeast", "north_east", "north-east", "ne"] },
  { degrees: 90, label: "East", abbr: "E", keys: ["east", "e"] },
  { degrees: 135, label: "South-East", abbr: "SE", keys: ["southeast", "south_east", "south-east", "se"] },
  { degrees: 180, label: "South", abbr: "S", keys: ["south", "s"] },
  { degrees: 225, label: "South-West", abbr: "SW", keys: ["southwest", "south_west", "south-west", "sw"] },
  { degrees: 270, label: "West", abbr: "W", keys: ["west", "w"] },
  { degrees: 315, label: "North-West", abbr: "NW", keys: ["northwest", "north_west", "north-west", "nw"] },
];

export function normalizeFacing(value: string | null | undefined): { degrees: number; label: string; abbr: string } | null {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!key) return null;
  const hit = DIRECTIONS.find((d) => d.keys.includes(key));
  return hit ? { degrees: hit.degrees, label: hit.label, abbr: hit.abbr } : null;
}

export function FacingArrow({ facing }: { facing: string | null | undefined }): React.JSX.Element {
  const fixed = normalizeFacing(facing);

  if (!fixed) {
    return (
      <span
        role="img"
        aria-label="Facing not specified"
        title="Facing not specified"
        data-testid="facing-indicator"
        className="inline-flex! items-center! gap-1! text-gray-300!"
      >
        <ArrowUp className="h-4! w-4! shrink-0!" strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${fixed.label} facing`}
      title={fixed.label}
      data-testid="facing-indicator"
      className="inline-flex! items-center! gap-1! whitespace-nowrap! text-[#27427f]!"
    >
      <ArrowUp
        className="h-4! w-4! shrink-0!"
        strokeWidth={2.5}
        aria-hidden="true"
        style={{ transform: `rotate(${fixed.degrees}deg)` }}
      />
      <span className="text-sm! font-semibold!">{fixed.abbr}</span>
    </span>
  );
}
