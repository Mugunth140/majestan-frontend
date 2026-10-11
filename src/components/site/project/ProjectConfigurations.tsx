"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { ChevronDown, Grid3X3 } from "lucide-react";
import { formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import {
  groupUnitsByConfiguration,
  plotAreaCell,
  titleCase,
  unitFurnishings,
  unitLabel,
  unitRateLabel,
} from "@/lib/project-overview";

/**
 * Replaces the units table, which had three problems this layout does not.
 * It collapsed three different area measures (super built-up, built-up and
 * carpet) into one "Area" column, so a buyer could not tell which number
 * they were being quoted. It hid the floor plan behind a tiny link in the
 * unit cell. And on a phone each unit was split across a horizontal scroll,
 * which put the price two swipes away from the unit it belonged to.
 *
 * Grouping by configuration matches how buyers shop ("show me the 3 BHKs"),
 * and one card per unit keeps the price, the rate and the plan side by side.
 */

/** A buyer can act on green. Amber is in motion. Gray is gone. */
const STATUS_CLASS: Record<string, string> = {
  available: "bg-emerald-50! text-emerald-800! ring-emerald-200!",
  reserved: "bg-amber-50! text-amber-900! ring-amber-200!",
  booked: "bg-amber-50! text-amber-900! ring-amber-200!",
  sold: "bg-gray-100! text-gray-600! ring-gray-200!",
  rented: "bg-gray-100! text-gray-600! ring-gray-200!",
  inactive: "bg-gray-100! text-gray-600! ring-gray-200!",
};

function StatusChip({ status }: { status: string }) {
  const tone = STATUS_CLASS[status] ?? STATUS_CLASS.inactive;
  return (
    <span
      className={`inline-flex! items-center! px-2! py-0.5! rounded-md! text-xs! font-medium! ring-1! whitespace-nowrap! ${tone}`}
    >
      {titleCase(status)}
    </span>
  );
}

const TAB_BASE =
  "rounded-xl! px-4! py-2! text-left! shrink-0! cursor-pointer! transition-[background-color,color]! duration-150! ease-out-quint! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!";
const TAB_ACTIVE = "bg-[#27427f]! text-white! ring-1! ring-[#27427f]!";
const TAB_INACTIVE = "bg-white! ring-1! ring-gray-200! text-gray-700! hover:bg-gray-50!";

/** Browser-only reads for useSyncExternalStore: the server snapshot is empty. */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readHashKey = () => window.location.hash.slice(1);
const noHashKey = () => "";

type Spec = { label: string; value: string };

function sqft(value: string | number | null | undefined): string | null {
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) && n > 0 ? `${Math.round(n).toLocaleString("en-IN")} sq.ft` : null;
}

function floorValue(unit: ProjectUnit): string | null {
  if (unit.floorNo == null) return null;
  return unit.totalFloors ? `${unit.floorNo} of ${unit.totalFloors}` : `${unit.floorNo}`;
}

/** "1 · Covered · Guest" — the same shape the old table used, so nothing reads differently. */
function parkingValue(unit: ProjectUnit): string | null {
  const parts = [
    unit.parking != null ? `${unit.parking}` : null,
    unit.parkingType ? titleCase(String(unit.parkingType)) : null,
    unit.unitGuestParking ? "Guest" : null,
  ].filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Only rows the unit actually has. A spec sheet full of dashes makes a buyer
 * read every empty cell to learn that nothing is recorded.
 */
function unitSpecs(unit: ProjectUnit, project: ProjectDetail): Spec[] {
  const specs: Spec[] = [];
  const add = (label: string, value: string | null | undefined) => {
    if (value) specs.push({ label, value });
  };
  const facing = unit.facing ? titleCase(unit.facing) : null;

  if (project.projectType === "plot") {
    const plotArea = plotAreaCell(unit);
    add("Plot area", plotArea === "—" ? null : plotArea);
    add(
      "Dimensions",
      (unit.roomDimensions ?? []).find((room) => room?.name === "Plot")?.dimensions,
    );
    add("Facing", facing);
    if (unit.openSides != null) add("Open sides", `${unit.openSides}`);
    if (unit.boundaryWall) add("Boundary wall", "Yes");
    return specs;
  }

  add("Super built-up", sqft(unit.superBuiltupAreaSqft));
  add("Built-up", sqft(unit.builtupAreaSqft));
  add("Carpet", sqft(unit.carpetAreaSqft));
  // UDS is an apartment-only measure. Villas quote plot and built-up instead.
  if (project.projectType === "apartment") add("UDS", sqft(unit.udsAreaSqft));
  if (unit.bathrooms != null) add("Bathrooms", `${unit.bathrooms}`);
  if (unit.balconies != null) add("Balconies", `${unit.balconies}`);
  add("Floor", floorValue(unit));
  add("Facing", facing);
  add("Parking", parkingValue(unit));
  add("Furnishing", unit.furnishedStatus ? titleCase(unit.furnishedStatus) : null);
  if (unit.poojaRoom) add("Pooja room", "Yes");
  if (unit.studyRoom) add("Study room", "Yes");
  return specs;
}

/**
 * Room sizes sit behind a disclosure: useful when a buyer is checking a
 * bedroom fits a bed, noise for everyone else. The "Plot" entry is the plot
 * itself and already shows as Dimensions on plot cards.
 */
function roomSizes(unit: ProjectUnit): { name: string; dimensions: string }[] {
  return (unit.roomDimensions ?? []).filter(
    (room) => !!room?.name && room.name !== "Plot" && !!room.dimensions,
  );
}

function UnitCard({ unit, project }: { unit: ProjectUnit; project: ProjectDetail }) {
  const label = unitLabel(unit);
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  const planSentence = `${planNoun.charAt(0).toUpperCase()}${planNoun.slice(1)}`;
  const specs = unitSpecs(unit, project);
  const furnishings = unitFurnishings(unit);
  const rooms = project.projectType === "plot" ? [] : roomSizes(unit);
  const rate = unitRateLabel(unit, project.projectType);
  const priced = Number(unit.price) > 0;

  return (
    <article className="rounded-2xl! border! border-gray-200! overflow-hidden! md:grid! md:grid-cols-[13rem_1fr]!">
      <div className="bg-gray-50! md:border-r! md:border-gray-200! flex! items-center! justify-center! h-48! md:h-auto! md:min-h-52!">
        {unit.floorPlanImageUrl ? (
          <Link
            href={`/${project.canonicalSlug}/floor-plans`}
            className="group/plan block! relative! w-full! h-full! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-inset! focus-visible:ring-[#27427f]!"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={unit.floorPlanImageUrl}
              alt={`${label} ${planNoun}`}
              loading="lazy"
              decoding="async"
              className="w-full! h-full! object-contain! p-4!"
            />
            <span className="absolute! bottom-3! left-1/2! -translate-x-1/2! rounded-full! bg-white! px-3! py-1! text-xs! font-medium! text-[#27427f]! ring-1! ring-gray-200! whitespace-nowrap! group-hover/plan:text-[#1e3563]!">
              View {planNoun}
            </span>
          </Link>
        ) : (
          <div className="flex! flex-col! items-center! px-6! text-center!">
            <Grid3X3 className="w-6! h-6! text-gray-300!" aria-hidden="true" />
            <p className="text-xs! text-gray-500! mt-2!">{planSentence} on request</p>
          </div>
        )}
      </div>

      <div className="p-5! md:p-6! min-w-0!">
        <div className="flex! items-start! justify-between! gap-4!">
          <div className="min-w-0!">
            <h3 className="text-base! font-semibold! text-gray-900!">{label}</h3>
            {unit.unitCode && (
              <p className="text-xs! text-gray-500! mt-0.5!">{unit.unitCode}</p>
            )}
          </div>
          <StatusChip status={unit.status} />
        </div>

        <div className="mt-4!">
          {priced ? (
            <p className="text-2xl! font-semibold! text-gray-900! tracking-tight! tabular-nums!">
              {formatINR(unit.price)}
            </p>
          ) : (
            <p className="text-lg! font-semibold! text-gray-900!">Price on request</p>
          )}
          {rate && <p className="text-sm! text-gray-500! tabular-nums! mt-1!">{rate}</p>}
        </div>

        {specs.length > 0 && (
          <dl className="mt-5! pt-5! border-t! border-gray-200! grid! grid-cols-2! sm:grid-cols-3! gap-x-6! gap-y-4!">
            {specs.map((spec) => (
              <div key={spec.label} className="min-w-0!">
                <dt className="text-xs! font-medium! uppercase! tracking-wide! text-gray-500!">
                  {spec.label}
                </dt>
                <dd className="mt-1! text-sm! font-semibold! text-gray-900! break-words!">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {furnishings.length > 0 && (
          <p className="mt-4! text-sm! text-gray-600!">
            Includes {furnishings.slice(0, 4).join(" · ")}
            {furnishings.length > 4 ? ` +${furnishings.length - 4} more` : ""}
          </p>
        )}

        {rooms.length > 0 && (
          <details className="mt-4! group/rooms">
            <summary className="inline-flex! items-center! gap-1! text-sm! font-medium! text-[#27427f]! cursor-pointer! list-none! [&::-webkit-details-marker]:hidden! rounded-sm! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!">
              Room sizes
              <ChevronDown
                className="w-4! h-4! transition-transform! duration-150! ease-out-quint! group-open/rooms:rotate-180!"
                aria-hidden="true"
              />
            </summary>
            <dl className="mt-3! grid! grid-cols-2! gap-x-6! gap-y-2!">
              {rooms.map((room, index) => (
                <div key={`${room.name}-${index}`} className="min-w-0!">
                  <dt className="text-sm! text-gray-600!">{room.name}</dt>
                  <dd className="text-sm! text-gray-900! tabular-nums! break-words!">
                    {room.dimensions}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
    </article>
  );
}

export function ProjectConfigurations({ project }: { project: ProjectDetail }) {
  const groups = useMemo(() => groupUnitsByConfiguration(project), [project]);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pickedKey, setPickedKey] = useState<string | null>(null);

  // The overview's configuration cards link here as #<group key>. The server
  // has no hash, so it renders the default and the client reconciles to the
  // real one, without a hydration mismatch. A hash that matches no group falls
  // through to the default selection below.
  const hashKey = useSyncExternalStore(subscribeToHash, readHashKey, noHashKey);

  if (groups.length === 0) return null;

  // Open on a configuration the buyer can act on, so the page never lands on
  // a tab of sold stock. A picked key that no longer exists (the project was
  // re-fetched with different units) falls back to the same default.
  const firstOpen =
    groups.find((group) => group.units.some((u) => u.status === "available")) ?? groups[0];
  const active = groups.find((group) => group.key === (pickedKey ?? hashKey)) ?? firstOpen;
  const activeIndex = groups.indexOf(active);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;

  const select = (index: number) => {
    setPickedKey(groups[index].key);
    tabRefs.current[index]?.focus();
  };

  // Arrow keys move selection and focus together, the ARIA tabs pattern.
  // The selected tab is the only one in the tab order, so Tab leaves the
  // list instead of walking through every configuration.
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = groups.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
  };

  const cards = active.units.map((unit) => (
    <UnitCard key={unit.id} unit={unit} project={project} />
  ));

  // One configuration needs no switcher. A tab with nothing to switch between
  // is just noise above the only panel.
  if (groups.length === 1) {
    return <div className="flex! flex-col! gap-4!">{cards}</div>;
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Configurations"
        className="flex! gap-2! overflow-x-auto! hide-scrollbar pb-1!"
      >
        {groups.map((group, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={group.key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              <span className="block! text-sm! font-semibold!">{group.label}</span>
              <span
                className={`block! text-xs! mt-0.5! ${isActive ? "text-white/80!" : "text-gray-500!"}`}
              >
                {group.minPrice != null
                  ? `from ${formatINR(group.minPrice)}`
                  : "Price on request"}
              </span>
            </button>
          );
        })}
      </div>

      {/* No animation on the switch. Buyers flip between configurations
          repeatedly, and a fade on every flip makes the page feel slow. */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(activeIndex)}
        tabIndex={0}
        className="flex! flex-col! gap-4! mt-6! rounded-2xl! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
      >
        {cards}
      </div>
    </>
  );
}
