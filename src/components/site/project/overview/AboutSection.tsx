"use client";

import { useState } from "react";
import type { ProjectDetail } from "@/lib/api/projects";
import { buildDetailRows } from "@/lib/project-overview";
import {
  BODY,
  Card,
  DefinitionGrid,
  Divider,
  LABEL,
  Subheading,
  TEXT_LINK,
  paragraphs,
} from "@/components/site/project/project-ui";

/** Shown in place of a description so the card never opens on an empty gap. */
const NO_DESCRIPTION =
  "A full description has not been published for this project yet. Send an enquiry and our team will share the details.";

type TowerRow = { name: string; floors: string; units: string };

/**
 * Towers only exist on apartment and villa projects. A row with none of its
 * three values is dropped, so the table never shows a line of dashes.
 */
function towerRows(project: ProjectDetail): TowerRow[] {
  if (project.projectType === "plot") return [];
  return (project.towerDetails ?? []).flatMap((tower) => {
    const name = tower?.tower?.trim() || null;
    const floors = tower?.floors ? `${tower.floors}` : null;
    const units = tower?.units ? `${tower.units}` : null;
    if (!name && !floors && !units) return [];
    return [{ name: name ?? "—", floors: floors ?? "—", units: units ?? "—" }];
  });
}

const HEAD_CELL = `${LABEL} py-2! pr-4!`;

export function AboutSection({ project }: { project: ProjectDetail }) {
  const [expanded, setExpanded] = useState(false);
  const descriptionParagraphs = paragraphs(project.description);
  const rows = buildDetailRows(project);
  const towers = towerRows(project);
  const collapsible = descriptionParagraphs.length > 1;
  const visibleParagraphs =
    collapsible && !expanded
      ? descriptionParagraphs.slice(0, 1)
      : descriptionParagraphs;

  return (
    <Card title={`About ${project.name}`} id="about">
      <div className="mt-6! flex! flex-col! gap-4!">
        {visibleParagraphs.length > 0 ? (
          visibleParagraphs.map((text, index) => (
            <p key={index} className={`${BODY} text-pretty!`}>
              {text}
            </p>
          ))
        ) : (
          <p className={`${BODY} text-pretty!`}>{NO_DESCRIPTION}</p>
        )}
      </div>

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={`mt-3! inline-flex! cursor-pointer! items-center! border-0! bg-transparent! p-0! text-sm! font-medium! ${TEXT_LINK}`}
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}

      {rows.length > 0 && (
        <>
          <Divider />
          <DefinitionGrid rows={rows} />
        </>
      )}

      {towers.length > 0 && (
        <>
          <Divider />
          <Subheading>Towers</Subheading>
          <div className="mt-4! overflow-x-auto!">
            <table className="data-table w-full! text-left! border-collapse!">
              <thead>
                <tr>
                  <th scope="col" className={HEAD_CELL}>
                    Tower
                  </th>
                  <th scope="col" className={HEAD_CELL}>
                    Floors
                  </th>
                  <th scope="col" className={HEAD_CELL}>
                    Units
                  </th>
                </tr>
              </thead>
              <tbody>
                {towers.map((tower, index) => (
                  <tr key={index} className="border-t! border-gray-200!">
                    <td className="py-3! pr-4! text-sm! text-gray-900!">{tower.name}</td>
                    <td className="py-3! pr-4! text-sm! text-gray-900! tabular-nums!">
                      {tower.floors}
                    </td>
                    <td className="py-3! pr-4! text-sm! text-gray-900! tabular-nums!">
                      {tower.units}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
