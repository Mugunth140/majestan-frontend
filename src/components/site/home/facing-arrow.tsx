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
      <span title="Facing not specified" className="inline-flex! items-center! justify-center!">
        <ArrowUp className="w-4! h-4! text-gray-300!" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only!">Facing not specified</span>
      </span>
    );
  }

  return (
    <span title={fixed.label} className="inline-flex! items-center! justify-center!">
      <ArrowUp
        className="w-4! h-4! text-gray-700!"
        strokeWidth={2}
        aria-hidden="true"
        style={{ transform: `rotate(${fixed.degrees}deg)` }}
      />
      <span className="sr-only!">{fixed.label} facing</span>
    </span>
  );
}
