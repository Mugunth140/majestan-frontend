import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import {
  titleCase,
  unitAreaCell,
  unitFurnishings,
  unitLabel,
} from "@/lib/project-overview";

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

type Column = {
  key: string;
  label: string;
  render: (unit: ProjectUnit) => React.ReactNode;
};

const dash = "—";

/**
 * One column spec drives both renderings below. The old table was desktop-only
 * inside an `overflow-x-auto`: eight columns on a phone meant the price was
 * two swipes to the right of the unit it belonged to.
 */
function buildColumns(project: ProjectDetail): Column[] {
  const isPlot = project.projectType === "plot";
  const columns: Column[] = [
    {
      key: "area",
      label: isPlot ? "Plot size" : "Area",
      render: (unit) => unitAreaCell(unit, project.projectType),
    },
  ];

  if (isPlot) {
    columns.push({
      key: "dimensions",
      label: "Dimensions",
      render: (unit) =>
        (unit.roomDimensions ?? []).find((room) => room?.name === "Plot")?.dimensions ??
        dash,
    });
  } else {
    columns.push(
      {
        key: "floor",
        label: "Floor",
        render: (unit) =>
          unit.floorNo != null
            ? unit.totalFloors
              ? `${unit.floorNo} of ${unit.totalFloors}`
              : `${unit.floorNo}`
            : dash,
      },
      {
        key: "bath",
        label: "Bath",
        render: (unit) => (unit.bathrooms != null ? `${unit.bathrooms}` : dash),
      },
      {
        key: "parking",
        label: "Parking",
        render: (unit) =>
          [
            unit.parking != null ? `${unit.parking}` : null,
            unit.parkingType ? titleCase(String(unit.parkingType)) : null,
            unit.unitGuestParking ? "Guest" : null,
          ]
            .filter(Boolean)
            .join(" · ") || dash,
      },
    );
  }

  columns.push({
    key: "facing",
    label: "Facing",
    render: (unit) => (unit.facing ? titleCase(unit.facing) : dash),
  });

  return columns;
}

function UnitHeading({ unit, project }: { unit: ProjectUnit; project: ProjectDetail }) {
  const furnishings = unitFurnishings(unit);
  return (
    <>
      <span className="block! text-sm! font-semibold! text-gray-900!">
        {unitLabel(unit)}
      </span>
      {unit.unitCode && (
        <span className="block! text-xs! text-gray-500! mt-0.5!">{unit.unitCode}</span>
      )}
      {furnishings.length > 0 && (
        <span className="block! text-xs! text-gray-500! mt-0.5!">
          {furnishings.slice(0, 3).join(" · ")}
          {furnishings.length > 3 ? ` +${furnishings.length - 3}` : ""}
        </span>
      )}
      {unit.floorPlanImageUrl && (
        <Link
          href={`/${project.canonicalSlug}/floor-plans`}
          className="inline-flex! items-center! gap-1! mt-1! text-xs! font-medium! text-[#27427f]! no-underline! transition-colors! duration-150! ease-out-quint! hover:text-[#1e3563]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! rounded-sm!"
        >
          <Grid3X3 className="w-3! h-3!" />
          Plan
        </Link>
      )}
    </>
  );
}

export function ProjectUnitsTable({ project }: { project: ProjectDetail }) {
  const columns = buildColumns(project);
  const units = project.units;
  if (units.length === 0) return null;

  return (
    <>
      {/* Desktop: a real table, because this is tabular data and a buyer
          compares down a column. */}
      <div className="hidden! md:block! overflow-x-auto!">
        <table className="data-table w-full! text-left! border-collapse!">
          <caption className="sr-only">
            Available configurations and pricing for {project.name}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="py-2! pr-4! text-xs! font-medium! uppercase! tracking-wide! text-gray-500!"
              >
                Unit
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="py-2! pr-4! text-xs! font-medium! uppercase! tracking-wide! text-gray-500!"
                >
                  {column.label}
                </th>
              ))}
              <th
                scope="col"
                className="py-2! pr-4! text-xs! font-medium! uppercase! tracking-wide! text-gray-500!"
              >
                Price
              </th>
              <th
                scope="col"
                className="py-2! text-xs! font-medium! uppercase! tracking-wide! text-gray-500!"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-t! border-gray-200!">
                <th scope="row" className="py-3! pr-4! align-top! font-normal!">
                  <UnitHeading unit={unit} project={project} />
                </th>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="py-3! pr-4! align-top! text-sm! text-gray-700!"
                  >
                    {column.render(unit)}
                  </td>
                ))}
                <td className="py-3! pr-4! align-top! text-sm! font-semibold! text-gray-900! tabular-nums! whitespace-nowrap!">
                  {unit.price ? formatINR(unit.price) : "On request"}
                </td>
                <td className="py-3! align-top!">
                  <StatusChip status={unit.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per unit, so the price never leaves the unit's side. */}
      <ul className="md:hidden! flex! flex-col! gap-3! list-none! p-0! m-0!">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="rounded-2xl! border! border-gray-200! p-4!"
          >
            <div className="flex! items-start! justify-between! gap-3!">
              <div className="min-w-0!">
                <UnitHeading unit={unit} project={project} />
              </div>
              <div className="text-right! shrink-0!">
                <span className="block! text-sm! font-semibold! text-gray-900! tabular-nums!">
                  {unit.price ? formatINR(unit.price) : "On request"}
                </span>
                <span className="block! mt-1!">
                  <StatusChip status={unit.status} />
                </span>
              </div>
            </div>
            <dl className="mt-3! pt-3! border-t! border-gray-200! grid! grid-cols-2! gap-x-4! gap-y-2!">
              {columns.map((column) => (
                <div key={column.key} className="min-w-0!">
                  <dt className="text-xs! font-medium! uppercase! tracking-wide! text-gray-500!">
                    {column.label}
                  </dt>
                  <dd className="mt-0.5! text-sm! text-gray-700! break-words!">
                    {column.render(unit)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
