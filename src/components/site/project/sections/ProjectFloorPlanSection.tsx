"use client";

import {
  BedDouble,
  Building2,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid3X3,
  IndianRupee,
  LayoutGrid,
  Sofa,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import {
  summarizeConfigurations,
  unitAreaLabel,
} from "@/lib/project-config-summary";
import {
  groupUnitsByConfiguration,
  titleCase,
  unitFloorPlans,
  type ConfigurationGroup,
} from "@/lib/project-overview";
import { unitSpecGroups, type SpecGroup, type SpecGroupKey } from "@/lib/unit-spec-groups";
import { Card, EmptyState, LABEL } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { FloorPlanLightbox, type FloorPlanSlide } from "@/components/site/project/FloorPlanLightbox";
import { CompactSummaryBody } from "@/components/site/project/configuration-parts";
import { StatusChip } from "@/components/site/project/configuration-parts";

/**
 * Configurations and floor plans on one page. The overview shows a card per
 * configuration and a plan per configuration; this is where both lead.
 *
 * At the top, compact configuration cards as jump links. Then a section per
 * configuration. Its units run down the page separated by rules, not boxes:
 * each leads with its name, then its floor plan (tap to enlarge), then its
 * spec sheet as collapsible categories, closed until asked for.
 */

/* The page's own card: the shared CARD with more room inside, since it
   holds the active unit's whole detail. */
const CONFIGURATION_CARD =
  "bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! p-5! sm:p-8! lg:p-10! min-w-0!";

/** "1,910 sq.ft" → "1910 SQ.FT"; plots "4 cents" → "4 CENTS". */
function unitTabLabel(unit: ProjectUnit, projectType: string): string {
  const area = unitAreaLabel(unit, projectType);
  if (area) return area.replace(/,/g, "").toUpperCase();
  return unit.title?.trim() || unit.unitCode || `Unit ${unit.id}`;
}

/** The title a buyer would use for the unit: its CRM title, else its code. */
function unitName(unit: ProjectUnit, index: number): string {
  return unit.title?.trim() || unit.unitCode || `Unit ${index + 1}`;
}

/** "U1 · 2 BHK · Floor 12 of 15 · North facing", without repeating the name. */
function unitMeta(unit: ProjectUnit, name: string, group: ConfigurationGroup): string {
  const floorText = (() => {
    if (unit.floorNo == null || String(unit.floorNo).trim() === "") return null;
    const str = String(unit.floorNo).trim();
    const prefix = str.includes(",") ? "Floors" : "Floor";
    return `${prefix} ${str}${unit.totalFloors ? ` of ${unit.totalFloors}` : ""}`;
  })();

  return [
    unit.unitCode && unit.unitCode !== name ? unit.unitCode : null,
    group.label,
    floorText,
    unit.facing ? `${titleCase(unit.facing)} facing` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const GROUP_ICON: Record<SpecGroupKey, React.ElementType> = {
  price: IndianRupee,
  rooms: BedDouble,
  position: Building2,
  parking: Car,
  furnishing: Sofa,
  plot: Compass,
};

/**
 * One category of a unit's spec sheet. Closed by default, with its answer
 * on the row ("₹6 Cr · 1,450 sq.ft"), so units compare without opening
 * anything. Flat: a rule above and below, no box around it.
 */
function SpecCategory({ group }: { group: SpecGroup }) {
  const Icon = GROUP_ICON[group.key];
  return (
    <details className="group/spec">
      <summary className="list-none! [&::-webkit-details-marker]:hidden! cursor-pointer! flex! items-center! gap-3! py-3.5! rounded-md! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!">
        <Icon className="w-4! h-4! shrink-0! text-[#27427f]!" strokeWidth={1.75} aria-hidden="true" />
        <span className="min-w-0! flex-1! sm:flex! sm:items-baseline! sm:justify-between! sm:gap-4!">
          <span className="block! text-sm! font-semibold! text-gray-900!">{group.title}</span>
          {group.preview && (
            <span className="block! text-sm! text-gray-500! tabular-nums! truncate! group-open/spec:sm:invisible!">
              {group.preview}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="w-4! h-4! shrink-0! text-gray-500! transition-transform! duration-200! ease-out-quint! group-open/spec:rotate-180!"
        />
      </summary>

      <div className="pb-5! pl-7!">
        {group.rows.length > 0 && (
          <dl className="mb-0! grid! grid-cols-2! sm:grid-cols-3! gap-x-6! gap-y-4!">
            {group.rows.map((row) => (
              <div key={row.label} className="min-w-0!">
                <dt className={LABEL}>{row.label}</dt>
                <dd className="mb-0! mt-1! text-sm! font-semibold! text-gray-900! tabular-nums! break-words!">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {group.rooms.length > 0 && (
          <div className={group.rows.length > 0 ? "mt-5!" : ""}>
            <p className={LABEL}>Room sizes</p>
            <dl className="mb-0! mt-2! grid! grid-cols-2! sm:grid-cols-3! gap-x-6! gap-y-3!">
              {group.rooms.map((room, index) => (
                <div key={`${room.name}-${index}`} className="min-w-0!">
                  <dt className="text-sm! text-gray-600!">{room.name}</dt>
                  <dd className="mb-0! text-sm! font-semibold! text-gray-900! tabular-nums! break-words!">
                    {room.dimensions}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {group.items.length > 0 && (
          <div className={group.rows.length > 0 || group.rooms.length > 0 ? "mt-5!" : ""}>
            <p className={LABEL}>Included</p>
            <ul className="mt-2! flex! flex-wrap! gap-2! list-none! p-0! m-0!">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg! bg-gray-50! ring-1! ring-gray-200/70! px-2.5! py-1! text-sm! text-gray-700!"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function UnitCard({
  unit,
  index,
  group,
  project,
  slides,
  slideIndex,
  floorIndex,
  onFloorChange,
}: {
  unit: ProjectUnit;
  index: number;
  group: ConfigurationGroup;
  project: ProjectDetail;
  /** Every plan in the project; this card's trigger opens at slideIndex. */
  slides: FloorPlanSlide[];
  slideIndex: (unitId: number, floorIndex: number) => number | undefined;
  floorIndex: number;
  onFloorChange: (index: number) => void;
}) {
  const name = unitName(unit, index);
  const meta = unitMeta(unit, name, group);
  const priced = Number(unit.price) > 0;
  const area = unitAreaLabel(unit, project.projectType);
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  const groups = unitSpecGroups(unit, project);
  const headingId = `unit-${unit.id}-name`;
  const floorPlans = unitFloorPlans(unit);
  const selectedFloor = floorPlans[Math.min(floorIndex, Math.max(floorPlans.length - 1, 0))];

  const saleableNum = parseFloat(String(unit.superBuiltupAreaSqft ?? unit.builtupAreaSqft ?? ""));
  const saleable =
    Number.isFinite(saleableNum) && saleableNum > 0
      ? `${Math.round(saleableNum).toLocaleString("en-IN")} sq.ft`
      : null;
  const possession = (() => {
    const raw = (project.possessionDate || "").trim();
    const dt = raw ? new Date(raw) : null;
    if (dt && !isNaN(dt.getTime())) {
      const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
      return `${mon}, ${dt.getFullYear()}`;
    }
    return project.possessionStatus ? titleCase(project.possessionStatus) : null;
  })();

  return (
    <article aria-labelledby={headingId} className="py-6! first:pt-0! last:pb-0!">
      {/* Name first, as asked of every unit; price and status on the right
          so a buyer scanning down the page reads the same columns. */}
      <header className="flex! items-start! justify-between! gap-4!">
        <div className="min-w-0!">
          <h3 id={headingId} className="text-lg! sm:text-xl! font-semibold! text-gray-900! break-words!">
            {name}
          </h3>
          {meta && <p className="mt-1! text-sm! text-gray-500!">{meta}</p>}
        </div>
        <div className="shrink-0! flex! flex-col! items-end! gap-1.5! text-right!">
          <p className="text-lg! sm:text-xl! font-semibold! text-gray-900! tabular-nums! tracking-tight!">
            {priced ? formatINR(unit.price) : "On request"}
          </p>
          {area && <p className="text-sm! text-gray-500! tabular-nums!">{area}</p>}
          <StatusChip status={unit.status} />
        </div>
      </header>

      <div className="mt-5!">
        {selectedFloor ? (
          <>
            {floorPlans.length > 1 && (
              <div role="group" aria-label={`Choose a floor for ${name}`} className="mb-3! flex! flex-wrap! gap-2!">
                {floorPlans.map((floor, index) => (
                  <button
                    key={`${floor.floorName}-${index}`}
                    type="button"
                    aria-pressed={index === floorIndex}
                    onClick={() => onFloorChange(index)}
                    className={`rounded-full! border! px-3! py-1.5! text-sm! font-medium! transition-colors! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! ${
                      index === floorIndex
                        ? "border-[#27427f]! bg-[#27427f]! text-white!"
                        : "border-gray-200! bg-white! text-gray-700! hover:border-[#27427f]/40! hover:text-[#27427f]!"
                    }`}
                  >
                    {floor.floorName}
                  </button>
                ))}
              </div>
            )}
            <FloorPlanLightbox
              items={slides}
              index={slideIndex(unit.id, Math.min(floorIndex, floorPlans.length - 1)) ?? 0}
            />
          </>
        ) : (
          <div className="flex! flex-col! items-center! justify-center! gap-3! rounded-xl! bg-gray-50! px-6! py-8! text-center!">
            <span
              aria-hidden="true"
              className="grid! place-items-center! w-10! h-10! rounded-xl! bg-white! ring-1! ring-gray-200!"
            >
              <Grid3X3 className="w-5! h-5! text-gray-500!" strokeWidth={1.75} />
            </span>
            <p className="text-sm! text-gray-600!">
              The {planNoun} for {name} is shared on request.
            </p>
            <RequestButton
              label={`Request ${planNoun}`}
              message={`Please send the ${planNoun} for ${name} (${group.label}) at ${project.name}.`}
            />
          </div>
        )}
      </div>

      {groups.length > 0 && (
        <div className="mt-4! border-t! border-gray-200! divide-y! divide-gray-200!">
          {groups.map((specGroup) => (
            <SpecCategory key={specGroup.key} group={specGroup} />
          ))}
        </div>
      )}

      {(saleable || project.reraNumber || possession) && (
        <dl className="mt-6! grid! grid-cols-1! sm:grid-cols-3! gap-4! border-t! border-gray-200! pt-5!">
          {saleable && (
            <div className="min-w-0!">
              <dt className={LABEL}>Saleable Area</dt>
              <dd className="mb-0! mt-1! text-sm! font-semibold! text-gray-900! tabular-nums!">
                {saleable}
              </dd>
            </div>
          )}
          {project.reraNumber && (
            <div className="min-w-0!">
              <dt className={LABEL}>Rera ID</dt>
              <dd className="mb-0! mt-1! text-sm! font-semibold! text-gray-900! break-words!">
                {project.reraNumber}
              </dd>
            </div>
          )}
          {possession && (
            <div className="min-w-0!">
              <dt className={LABEL}>Possession Status</dt>
              <dd className="mb-0! mt-1! text-sm! font-semibold! text-gray-900!">
                {possession}
              </dd>
            </div>
          )}
        </dl>
      )}
    </article>
  );
}

function ActiveUnitPanel({
  groups,
  activeUnit,
  project,
  floorIndex,
  onFloorChange,
}: {
  groups: ConfigurationGroup[];
  activeUnit: ProjectUnit | null;
  project: ProjectDetail;
  floorIndex: number;
  onFloorChange: (index: number) => void;
}) {
  if (!activeUnit) return null;
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  // The viewer steps through every plan in the project, opening at the
  // unit it was tapped on. Units without an image are skipped.
  const slides: FloorPlanSlide[] = [];
  const slideIndexByUnitFloor = new Map<string, number>();
  for (const group of groups) {
    group.units.forEach((unit, unitIndex) => {
      const name = unitName(unit, unitIndex);
      unitFloorPlans(unit).forEach((floor, floorIndex) => {
        slideIndexByUnitFloor.set(`${unit.id}:${floorIndex}`, slides.length);
        slides.push({
          src: floor.imageUrl,
          alt: `${name}${floor.floorName === "Floor plan" ? "" : ` ${floor.floorName}`} ${planNoun}, ${group.label}, ${project.name}`,
          title: floor.floorName === "Floor plan" ? `${name} ${planNoun}` : `${name} · ${floor.floorName} ${planNoun}`,
          subtitle: unitMeta(unit, name, group),
        });
      });
    });
  }
  return (
    <section aria-label="Unit details" className={CONFIGURATION_CARD}>
      {groups.map((group) =>
        group.units.map((unit, index) => (
          <div key={unit.id} hidden={unit.id !== activeUnit.id}>
            <UnitCard
              unit={unit}
              index={index}
              group={group}
              project={project}
              slides={slides}
              slideIndex={(unitId, floorIndex) => slideIndexByUnitFloor.get(`${unitId}:${floorIndex}`)}
              floorIndex={floorIndex}
              onFloorChange={onFloorChange}
            />
          </div>
        )),
      )}
    </section>
  );
}

export function ProjectFloorPlanSection({ project }: { project: ProjectDetail }) {
  if (project.units.length === 0) {
    const plural = `${getFloorPlanLabel(project.projectType).toLowerCase()}s`;
    return (
      <Card title="Configurations" id="configurations">
        <EmptyState
          icon={LayoutGrid}
          title="Configurations are being finalised"
          body={`Unit types, prices and ${plural} appear here once the developer releases them.`}
          action={
            <RequestButton
              label="Ask for details"
              message={`Please share the configurations, prices and ${plural} at ${project.name}.`}
            />
          }
        />
      </Card>
    );
  }

  const groups = groupUnitsByConfiguration(project);
  const [activeConfigKey, setActiveConfigKey] = useState(groups[0]?.key ?? "");
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const querySelectionApplied = useRef(false);

  const activeGroup = groups.find((g) => g.key === activeConfigKey) ?? groups[0];
  const activeUnit =
    activeGroup?.units.find((u) => u.id === activeUnitId) ?? activeGroup?.units[0] ?? null;

  // Overview teasers can point directly to the unit and floor they show.
  // Read the query after hydration so the server and first client render agree.
  useEffect(() => {
    if (querySelectionApplied.current) return;
    querySelectionApplied.current = true;
    const params = new URLSearchParams(window.location.search);
    const unitId = Number(params.get("unitId"));
    const floorName = params.get("floor");
    if (!Number.isInteger(unitId)) return;
    const group = groups.find((candidate) => candidate.units.some((unit) => unit.id === unitId));
    const unit = group?.units.find((candidate) => candidate.id === unitId);
    if (!group || !unit) return;
    setActiveConfigKey(group.key);
    setActiveUnitId(unit.id);
    const plans = unitFloorPlans(unit);
    const requestedIndex = plans.findIndex((plan) => plan.floorName === floorName);
    setActiveFloorIndex(requestedIndex >= 0 ? requestedIndex : 0);
  }, [groups]);

  // Switching configuration resets to that group's first unit.
  const selectConfig = (key: string) => {
    setActiveConfigKey(key);
    setActiveUnitId(null);
    setActiveFloorIndex(0);
  };

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  // Duplicate areas get the unit code appended ("1910 SQ.FT · U2").
  const unitLabels = (() => {
    if (!activeGroup) return new Map<number, string>();
    const seen = new Map<string, number>();
    const out = new Map<number, string>();
    for (const u of activeGroup.units) {
      const base = unitTabLabel(u, project.projectType);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      out.set(u.id, n > 1 ? `${base} · ${u.unitCode}` : base);
    }
    return out;
  })();

  return (
    <>
      {/* Config tabs: one card per configuration. The page h1 names the
          section; the tablist carries the names. */}
      <div role="tablist" aria-label="Configurations" className="mt-4! grid! grid-cols-2! sm:grid-cols-3! gap-3!">
        {summarizeConfigurations(project).map((summary) => {
          const selected = summary.key === activeConfigKey;
          return (
            <button
              key={summary.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectConfig(summary.key)}
              className={`text-left! rounded-xl! border! overflow-hidden! bg-white! transition-all! duration-150! ease-out-quint! cursor-pointer! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! ${
                selected
                  ? "border-[#27427f]! ring-2! ring-[#27427f]/30! shadow-sm!"
                  : "border-[#d3ddf3]! hover:border-[#27427f]/40! hover:shadow-sm!"
              }`}
            >
              <CompactSummaryBody summary={summary} />
            </button>
          );
        })}
      </div>

      {/* Unit switcher: one tab per unit area. Hidden for single-unit
          configurations; swipe on touch, arrows elsewhere. */}
      {activeGroup && activeGroup.units.length > 1 && (
        <div className="mt-4! flex! items-center! gap-1!">
          <button
            type="button"
            aria-label="Scroll units left"
            onClick={() => scrollStrip(-1)}
            className="shrink-0! p-2! rounded-full! text-gray-500! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer!"
          >
            <ChevronLeft className="w-5! h-5!" />
          </button>
          <div
            ref={stripRef}
            role="tablist"
            aria-label="Units"
            className="flex! flex-1! items-stretch! gap-6! overflow-x-auto! scrollbar-hide! border-b! border-gray-200!"
          >
            {activeGroup.units.map((u) => {
              const selected = u.id === activeUnit?.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveUnitId(u.id);
                    setActiveFloorIndex(0);
                  }}
                  className={`shrink-0! px-1! py-2.5! text-sm! font-semibold! tracking-wide! tabular-nums! whitespace-nowrap! border-b-2! -mb-px! transition-colors! cursor-pointer! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! ${
                    selected
                      ? "text-[#27427f]! border-[#27427f]!"
                      : "text-gray-500! border-transparent! hover:text-gray-900!"
                  }`}
                >
                  {unitLabels.get(u.id) ?? unitTabLabel(u, project.projectType)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Scroll units right"
            onClick={() => scrollStrip(1)}
            className="shrink-0! p-2! rounded-full! text-gray-500! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer!"
          >
            <ChevronRight className="w-5! h-5!" />
          </button>
        </div>
      )}

      <div className="mt-6!">
        <ActiveUnitPanel
          groups={groups}
          activeUnit={activeUnit}
          project={project}
          floorIndex={activeFloorIndex}
          onFloorChange={setActiveFloorIndex}
        />
      </div>
    </>
  );
}
