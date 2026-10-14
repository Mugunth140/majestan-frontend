"use client";

import { useState } from "react";
import { Check, ListChecks } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { bulletLines } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { specPoints } from "@/components/site/project/overview/spec-points";
import {
  BODY_TEXT,
  HAIRLINE,
  INK,
  PROSE,
  Panel,
  PanelEmpty,
  SECTION_HEADING,
  TOGGLE,
} from "@/components/site/project/overview/overview-ui";

/* Two visual rows of the two-column list before "Show all". */
const HIGHLIGHTS_PREVIEW = 6;
/* The first row of the two-column spec grid; the rest behind "Show all". */
const SPECS_PREVIEW = 2;

/**
 * Highlights (marketing lines) and the specification sheet. When both exist
 * they share one surface but each gets a heading at section size, rather than
 * a section heading over two sub-headings.
 *
 * Each specification is a label with its points beneath — up to five, one per
 * line in the CRM.
 */
export function SpecsHighlights({ project }: { project: ProjectDetail }) {
  const [highlightsExpanded, setHighlightsExpanded] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const highlights = bulletLines(project.highlights);
  const specs = (project.specifications ?? []).flatMap((spec) => {
    const label = spec?.label?.trim();
    const points = specPoints(spec?.value ?? "");
    return label && points.length > 0 ? [{ label, points }] : [];
  });

  if (highlights.length === 0 && specs.length === 0) {
    return (
      <Panel title="Specifications" id="specifications">
        <PanelEmpty
          icon={ListChecks}
          title="Specifications aren't published yet"
          body="Ask for the specification sheet: structure, flooring, fittings and finishes."
          action={
            <RequestButton
              label="Request specifications"
              message={`Please send the specification sheet for ${project.name}.`}
            />
          }
        />
      </Panel>
    );
  }

  const highlightsCollapsible = highlights.length > HIGHLIGHTS_PREVIEW;
  const specsCollapsible = specs.length > SPECS_PREVIEW;
  const visibleHighlights =
    highlightsCollapsible && !highlightsExpanded ? highlights.slice(0, HIGHLIGHTS_PREVIEW) : highlights;
  const visibleSpecs = specsCollapsible && !specsExpanded ? specs.slice(0, SPECS_PREVIEW) : specs;

  const specBlock = specs.length > 0 && (
    <>
      <ul className="m-0! mt-6! p-0! list-none! grid! grid-cols-1! sm:grid-cols-2! gap-x-10! gap-y-7!">
        {visibleSpecs.map((spec, index) => (
          <li key={`${spec.label}-${index}`} className={`min-w-0! border-t! pt-4! ${HAIRLINE}`}>
            <h3 className={`m-0! text-[15px]! font-semibold! ${INK}`}>{spec.label}</h3>
            <ul className="m-0! mt-2.5! p-0! list-none! flex! flex-col! gap-2!">
              {spec.points.map((point, k) => (
                <li key={k} className={`flex! items-start! gap-2.5! text-sm! leading-relaxed! text-pretty! ${BODY_TEXT}`}>
                  <span aria-hidden="true" className="mt-[9px]! w-1! h-1! shrink-0! rounded-full! bg-[var(--ov-ink)]!" />
                  <span className="min-w-0!">{point}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {specsCollapsible && (
        <button
          type="button"
          onClick={() => setSpecsExpanded((value) => !value)}
          aria-expanded={specsExpanded}
          className={`mt-6! ${TOGGLE}`}
        >
          {specsExpanded ? "Show fewer" : `Show all ${specs.length} specifications`}
        </button>
      )}
    </>
  );

  if (highlights.length === 0) {
    return (
      <Panel title="Specifications" id="specifications">
        {specBlock}
      </Panel>
    );
  }

  return (
    <Panel title="Highlights" id="specifications">
      {highlights.length === 1 ? (
        <p className={`m-0! mt-5! ${PROSE}`}>{highlights[0]}</p>
      ) : (
        <ul className="m-0! mt-6! p-0! grid! grid-cols-1! sm:grid-cols-2! gap-x-8! gap-y-3.5! list-none!">
          {visibleHighlights.map((line, index) => (
            <li key={index} className="flex! items-start! gap-3!">
              <span
                aria-hidden="true"
                className="mt-0.5! grid! place-items-center! w-5! h-5! shrink-0! rounded-full! bg-[linear-gradient(115deg,#2563eb,#1645bf)]!"
              >
                <Check className="w-3! h-3! text-white!" strokeWidth={3} />
              </span>
              <span className={`text-sm! leading-relaxed! ${BODY_TEXT}`}>{line}</span>
            </li>
          ))}
        </ul>
      )}
      {highlightsCollapsible && (
        <button
          type="button"
          onClick={() => setHighlightsExpanded((value) => !value)}
          aria-expanded={highlightsExpanded}
          className={`mt-5! ${TOGGLE}`}
        >
          {highlightsExpanded ? "Show fewer" : `Show all ${highlights.length}`}
        </button>
      )}

      {specs.length > 0 && (
        <div className="mt-12!">
          <h2 className={SECTION_HEADING}>Specifications</h2>
          {specBlock}
        </div>
      )}
    </Panel>
  );
}
