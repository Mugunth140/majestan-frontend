import { Check, ListChecks } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  BODY,
  Card,
  DefinitionGrid,
  Divider,
  EmptyState,
  Subheading,
  bulletLines,
} from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";

/**
 * The highlights are marketing lines and the specifications are the spec
 * sheet. They render as separate blocks only when both exist, so a project
 * with just one of them reads as a single list, not a heading over nothing.
 */
export function SpecsHighlights({ project }: { project: ProjectDetail }) {
  const highlights = bulletLines(project.highlights);
  const specs = (project.specifications ?? []).flatMap((spec) => {
    const label = spec?.label?.trim();
    const value = spec?.value?.trim();
    return label && value ? [{ label, value }] : [];
  });

  if (highlights.length === 0 && specs.length === 0) {
    return (
      <Card title="Specifications and highlights" id="specifications">
        <EmptyState
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
      </Card>
    );
  }

  const both = highlights.length > 0 && specs.length > 0;
  const headingGap = both ? "mt-4!" : "";

  return (
    <Card title="Specifications and highlights" id="specifications">
      <div className="mt-6!">
        {highlights.length > 0 && (
          <div>
            {both && <Subheading>Highlights</Subheading>}
            {highlights.length === 1 ? (
              <p className={`${BODY} text-pretty! ${headingGap}`}>{highlights[0]}</p>
            ) : (
              <ul
                className={`grid! grid-cols-1! sm:grid-cols-2! gap-x-6! gap-y-3! list-none! ${headingGap}`}
              >
                {highlights.map((line, index) => (
                  <li key={index} className="flex! items-start! gap-3!">
                    <Check
                      className="w-4! h-4! text-[#27427f]! shrink-0! mt-1!"
                      aria-hidden="true"
                    />
                    <span className="text-sm! text-gray-700!">{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {both && <Divider />}

        {specs.length > 0 && (
          <div>
            {both && <Subheading>Specifications</Subheading>}
            <div className={headingGap}>
              <DefinitionGrid rows={specs} columns={2} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
