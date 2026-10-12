import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { summarizeConfigurations } from "@/lib/project-config-summary";
import { Card, EmptyState, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { CompactSummaryBody, SummaryBody } from "@/components/site/project/configuration-parts";

/**
 * Shared by the configuration cards and the floor plan previews, so both
 * kinds of tile lift and ring the same way on hover and focus.
 */
const TILE_INTERACTION =
  "block! border! overflow-hidden! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-150! ease-out-quint! hover:border-[#27427f]/40! hover:shadow-sm! active:scale-[0.99]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!";

export const CONFIGURATION_TILE = `${TILE_INTERACTION} rounded-2xl! border-gray-200!`;
/* The floor plans page's jump cards: tighter corners, a blue-tinted edge to
   match their tinted header. */
const COMPACT_TILE = `${TILE_INTERACTION} rounded-xl! border-[#d3ddf3]!`;

/**
 * One card per configuration: type, area, price and availability. Each card
 * opens that configuration's detail on the floor plans page; `hrefFor` lets
 * that page reuse the cards as in-page jump links, in their compact form.
 */
export function ConfigurationTiles({
  project,
  hrefFor,
  compact = false,
}: {
  project: ProjectDetail;
  hrefFor: (key: string) => string;
  compact?: boolean;
}) {
  return (
    <ul
      className={`grid! list-none! p-0! m-0! ${
        compact
          ? "grid-cols-2! sm:grid-cols-3! gap-3!"
          : "grid-cols-1! sm:grid-cols-2! gap-4! mt-6!"
      }`}
    >
      {summarizeConfigurations(project).map((summary) => (
        <li key={summary.key} className="min-w-0!">
          <Link
            href={hrefFor(summary.key)}
            className={`${compact ? COMPACT_TILE : CONFIGURATION_TILE} h-full!`}
          >
            {compact ? <CompactSummaryBody summary={summary} /> : <SummaryBody summary={summary} />}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The overview's configuration section: the cards, and the way to the detail. */
export function ConfigurationSummary({ project }: { project: ProjectDetail }) {
  if (project.units.length === 0) {
    return (
      <Card title="Configurations" id="configurations">
        <EmptyState
          icon={LayoutGrid}
          title="Configurations are being finalised"
          body="Unit types, sizes and prices appear here once the developer releases them."
          action={
            <RequestButton
              label="Ask for prices"
              message={`Please share the available configurations and prices at ${project.name}.`}
            />
          }
        />
      </Card>
    );
  }

  const slug = project.canonicalSlug;
  return (
    <Card
      title="Configurations"
      id="configurations"
      action={<ViewAllLink href={`/${slug}/floor-plans`}>View more</ViewAllLink>}
    >
      <ConfigurationTiles
        project={project}
        hrefFor={() => `/${slug}/floor-plans`}
      />
    </Card>
  );
}
