import {
  BedDouble,
  Building2,
  Car,
  ChevronDown,
  Compass,
  Grid3X3,
  IndianRupee,
  LayoutGrid,
  Sofa,
} from "lucide-react";
import { formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import {
  summarizeConfigurations,
  unitAreaLabel,
  type ConfigurationSummary,
} from "@/lib/project-config-summary";
import {
  groupUnitsByConfiguration,
  titleCase,
  type ConfigurationGroup,
} from "@/lib/project-overview";
import { unitSpecGroups, type SpecGroup, type SpecGroupKey } from "@/lib/unit-spec-groups";
import { Card, EmptyState, LABEL } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { FloorPlanLightbox } from "@/components/site/project/FloorPlanLightbox";
import { ConfigurationTiles } from "@/components/site/project/overview/ConfigurationSummary";
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

/* The page's own card: the shared CARD with more room inside, since each
   of these holds a whole configuration. */
const CONFIGURATION_CARD =
  "bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! p-5! sm:p-8! lg:p-10! scroll-mt-32! min-w-0!";

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
}: {
  unit: ProjectUnit;
  index: number;
  group: ConfigurationGroup;
  project: ProjectDetail;
}) {
  const name = unitName(unit, index);
  const meta = unitMeta(unit, name, group);
  const priced = Number(unit.price) > 0;
  const area = unitAreaLabel(unit, project.projectType);
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  const groups = unitSpecGroups(unit, project);
  const headingId = `unit-${unit.id}-name`;

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
        {unit.floorPlanImageUrl ? (
          <FloorPlanLightbox
            src={unit.floorPlanImageUrl}
            alt={`${name} ${planNoun}, ${group.label}, ${project.name}`}
            title={`${name} ${planNoun}`}
            subtitle={meta}
          />
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
    </article>
  );
}

function ConfigurationDetail({
  group,
  summary,
  project,
}: {
  group: ConfigurationGroup;
  summary: ConfigurationSummary;
  project: ProjectDetail;
}) {
  const headingId = `${group.key}-heading`;
  const count = group.units.length;

  return (
    <section id={group.key} aria-labelledby={headingId} className={CONFIGURATION_CARD}>
      <div className="flex! flex-wrap! items-baseline! justify-between! gap-x-4! gap-y-1!">
        <h2 id={headingId} className="text-xl! md:text-2xl! font-normal! text-gray-900!">
          <span className="font-semibold! text-[#27427f]!">{summary.label}</span>{" "}
          {summary.typeLabel}
        </h2>
        <p className="text-sm! text-gray-500!">
          {count} {count === 1 ? "unit" : "units"}
        </p>
      </div>

      <div className="mt-8! sm:mt-10! divide-y! divide-gray-200!">
        {group.units.map((unit, index) => (
          <UnitCard key={unit.id} unit={unit} index={index} group={group} project={project} />
        ))}
      </div>
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
  const summaries = new Map(summarizeConfigurations(project).map((s) => [s.key, s]));

  return (
    <>
      {/* The jump cards stand on their own, without a wrapping card. The
          heading is for screen readers; the visible cards carry the names. */}
      <nav aria-labelledby="floor-plan-jumps-heading">
        <h2 id="floor-plan-jumps-heading" className="sr-only">
          Configurations
        </h2>
        <ConfigurationTiles project={project} hrefFor={(key) => `#${key}`} compact />
      </nav>

      {groups.map((group) => {
        const summary = summaries.get(group.key);
        return summary ? (
          <ConfigurationDetail key={group.key} group={group} summary={summary} project={project} />
        ) : null;
      })}
    </>
  );
}
