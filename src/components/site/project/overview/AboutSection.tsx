"use client";

import { useState } from "react";
import type { ProjectDetail } from "@/lib/api/projects";
import { getGroupedProjectDetails } from "@/lib/project-detail-groups";
import { GroupedDetails } from "@/components/site/shared/GroupedDetails";
import { paragraphs } from "@/components/site/project/project-ui";
import {
  INK,
  MUTED,
  PROSE,
  Panel,
  TOGGLE,
} from "@/components/site/project/overview/overview-ui";

/** Shown in place of a description so the card never opens on an empty gap. */
const NO_DESCRIPTION =
  "A full description has not been published for this project yet. Send an enquiry and our team will share the details.";

type Tower = { name: string; floors: number | null; units: number | null };

/**
 * Towers only exist on apartment and villa projects. A row with none of its
 * three values is dropped.
 */
function towerList(project: ProjectDetail): Tower[] {
  if (project.projectType === "plot") return [];
  return (project.towerDetails ?? []).flatMap((tower, index) => {
    const name = tower?.tower?.trim() || null;
    const floors = tower?.floors || null;
    const units = tower?.units || null;
    if (!name && !floors && !units) return [];
    return [{ name: name ?? `Tower ${index + 1}`, floors, units }];
  });
}

export function AboutSection({ project }: { project: ProjectDetail }) {
  const [expanded, setExpanded] = useState(false);
  const descriptionParagraphs = paragraphs(project.description);
  const groups = getGroupedProjectDetails(project);
  const towers = towerList(project);
  const collapsible = descriptionParagraphs.length > 1;
  const visibleParagraphs =
    collapsible && !expanded ? descriptionParagraphs.slice(0, 1) : descriptionParagraphs;

  return (
    <Panel title={`About ${project.name}`} id="about">
      <div className="mt-5! max-w-[68ch]!">
        <div className="flex! flex-col! gap-4!">
          {visibleParagraphs.length > 0 ? (
            visibleParagraphs.map((text, index) => (
              <p key={index} className={`m-0! ${PROSE}`}>
                {text}
              </p>
            ))
          ) : (
            <p className={`m-0! ${PROSE}`}>{NO_DESCRIPTION}</p>
          )}
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className={`mt-4! ${TOGGLE}`}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {groups.length > 0 && (
        <div className="mt-8!">
          <h3 className={`m-0! text-base! font-semibold! ${INK}`}>Project details</h3>
          <GroupedDetails groups={groups} id="project-details-groups" headingLevel={4} />
        </div>
      )}

      {towers.length > 0 && <TowerSummary towers={towers} />}
    </Panel>
  );
}

/* Blue shades for the towers, darkest first; they repeat past six. */
const TOWER_SHADES = ["#1645bf", "#2563eb", "#4f86f7", "#7fa8fb", "#a9c5fd", "#cddcfe"];

/**
 * The towers as a split of the project's units — one bar, a segment per tower
 * — with a tile per tower beneath carrying its floors and units. Pointing at a
 * tile or a segment picks out the same tower in both.
 */
function TowerSummary({ towers }: { towers: Tower[] }) {
  const [active, setActive] = useState<number | null>(null);
  const totalUnits = towers.reduce((sum, tower) => sum + (tower.units ?? 0), 0);
  const shade = (index: number) => TOWER_SHADES[index % TOWER_SHADES.length];

  return (
    <div className="mt-10!" onMouseLeave={() => setActive(null)}>
      <div className="flex! flex-wrap! items-baseline! justify-between! gap-x-4! gap-y-1!">
        <h3 className={`m-0! text-base! font-semibold! ${INK}`}>Towers</h3>
        <p className={`m-0! text-sm! tabular-nums! ${MUTED}`}>
          {towers.length} {towers.length === 1 ? "tower" : "towers"}
          {totalUnits > 0 ? ` · ${totalUnits} units` : ""}
        </p>
      </div>

      {totalUnits > 0 && (
        <div className="mt-4! flex! h-2.5! gap-1! overflow-hidden! rounded-full!" role="img" aria-label="Units by tower">
          {towers.map((tower, index) =>
            tower.units ? (
              <span
                key={`${tower.name}-${index}-bar`}
                onMouseEnter={() => setActive(index)}
                className={`block! h-full! transition-opacity! duration-200! ${active !== null && active !== index ? "opacity-30!" : ""}`}
                style={{ width: `${(tower.units / totalUnits) * 100}%`, background: shade(index) }}
              />
            ) : null,
          )}
        </div>
      )}

      <ul className="m-0! mt-4! p-0! list-none! grid! grid-cols-2! md:grid-cols-4! gap-3!">
        {towers.map((tower, index) => {
          const on = active === index;
          const share = totalUnits > 0 && tower.units ? Math.round((tower.units / totalUnits) * 100) : null;
          return (
            <li
              key={`${tower.name}-${index}`}
              tabIndex={0}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className={`min-w-0! rounded-xl! border! p-4! outline-none! transition-[border-color,box-shadow,transform,opacity]! duration-200! ease-out-quint! focus-visible:ring-2! focus-visible:ring-[var(--ov-blue)]! ${
                on
                  ? "-translate-y-0.5! border-[#bcd0f7]! bg-[linear-gradient(150deg,#fff,#eef4ff)]! shadow-[0_12px_26px_-18px_rgba(22,69,191,0.5)]!"
                  : `border-[#e6ebf2]! bg-white! ${active !== null ? "opacity-60!" : ""}`
              }`}
            >
              <span className="flex! items-center! gap-2!">
                <span className={`min-w-0! truncate! text-sm! font-semibold! ${INK}`}>{tower.name}</span>
                {share != null && <span className={`ml-auto! text-xs! tabular-nums! ${MUTED}`}>{share}%</span>}
              </span>
              <dl className="m-0! mt-3! grid! grid-cols-2! gap-2!">
                <div className="min-w-0! flex! flex-col-reverse!">
                  <dt className={`mt-1! text-xs! ${MUTED}`}>Floors</dt>
                  <dd className={`m-0! text-2xl! font-semibold! tracking-[-0.03em]! leading-none! tabular-nums! ${INK}`}>
                    {tower.floors ?? "—"}
                  </dd>
                </div>
                <div className="min-w-0! flex! flex-col-reverse!">
                  <dt className={`mt-1! text-xs! ${MUTED}`}>Units</dt>
                  <dd className={`m-0! text-2xl! font-semibold! tracking-[-0.03em]! leading-none! tabular-nums! ${INK}`}>
                    {tower.units ?? "—"}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
