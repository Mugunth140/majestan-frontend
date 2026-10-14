import Link from "next/link";
import { Sofa } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { RequestButton } from "@/components/site/project/RequestButton";
import { projectFurnishing, type Furnishing } from "@/components/site/project/overview/furnishing-parts";
import {
  INK,
  IconMark,
  MUTED,
  Panel,
  PanelEmpty,
  PanelLink,
} from "@/components/site/project/overview/overview-ui";

/**
 * The furnishing state in the heading's meta line: one value when every
 * configuration agrees, otherwise "2 BHK Semi Furnished · 3 BHK Unfurnished".
 */
function statusLine({ configurations, sharedStatus }: Furnishing): string | undefined {
  if (sharedStatus) {
    return configurations.length > 1 ? `${sharedStatus} across all configurations` : `${configurations[0].label} · ${sharedStatus}`;
  }
  const rows = configurations.flatMap((c) => (c.status ? [`${c.label} ${c.status}`] : []));
  return rows.length > 0 ? rows.join(" · ") : undefined;
}

/**
 * Furnishing is recorded per unit, so the overview shows the union across all
 * units. When the units differ, a note says so: otherwise a buyer reads the
 * list as a promise for every flat. The amenities page breaks it down by
 * configuration. Plots have nothing to furnish, so they get no section.
 */
export function FurnishingSection({ project }: { project: ProjectDetail }) {
  const furnishing = projectFurnishing(project);
  if (!furnishing) return null;

  const { items, varies, sharedStatus } = furnishing;
  const href = `/${project.canonicalSlug}/amenities#furnishing`;
  const meta = statusLine(furnishing);

  // An unfurnished handover is a complete answer; anything else without an
  // item list is a gap worth asking about.
  if (items.length === 0 && sharedStatus !== "Unfurnished") {
    return (
      <Panel title="Furnishing" id="furnishing" meta={meta}>
        <PanelEmpty
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
      </Panel>
    );
  }

  return (
    <Panel
      title="Furnishing"
      id="furnishing"
      meta={meta}
      action={items.length > 0 ? <PanelLink href={href}>By configuration</PanelLink> : undefined}
    >
      {items.length > 0 && (
        <ul className="m-0! mt-6! p-0! list-none! grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-x-4! gap-y-5!">
          {items.map((item) => (
            <li key={item.key} className="flex! items-center! gap-3! min-w-0!">
              <IconMark Icon={item.Icon} />
              <span className={`min-w-0! text-sm! font-medium! leading-snug! break-words! ${INK}`}>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
      {varies && items.length > 0 && (
        <p className={`m-0! mt-5! text-sm! ${MUTED}`}>
          Furnishing varies by configuration.{" "}
          <Link href={href} className="font-semibold! text-[var(--ov-ink)]! underline! decoration-[var(--ov-line-strong)]! underline-offset-4! hover:decoration-[var(--ov-ink)]!">
            See what each includes
          </Link>
          .
        </p>
      )}
    </Panel>
  );
}
