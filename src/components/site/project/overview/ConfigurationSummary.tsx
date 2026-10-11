import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  PRICE_ON_REQUEST,
  summarizeConfigurations,
} from "@/lib/project-config-summary";
import {
  Card,
  EmptyState,
  LABEL,
  ViewAllLink,
} from "@/components/site/project/project-ui";

/**
 * Shared by the floor plan previews, so both kinds of tile lift and ring the
 * same way on hover and focus.
 */
export const CONFIGURATION_TILE =
  "block! rounded-2xl! border! border-gray-200! overflow-hidden! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-150! ease-out-quint! hover:border-[#27427f]/40! hover:shadow-sm! active:scale-[0.99]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!";

export function ConfigurationSummary({ project }: { project: ProjectDetail }) {
  const summaries = summarizeConfigurations(project);
  if (summaries.length === 0) {
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
      action={<ViewAllLink href={`/${slug}/floor-plans`}>All details</ViewAllLink>}
    >
      <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4! mt-6!">
        {summaries.map((summary) => {
          const priced = summary.priceLabel !== PRICE_ON_REQUEST;
          const available = summary.availableCount;
          return (
            <Link
              key={summary.key}
              href={`/${slug}/floor-plans#${summary.key}`}
              className={CONFIGURATION_TILE}
            >
              <div className="bg-[#27427f]/5! px-5! py-3!">
                <p className="text-base!">
                  <span className="font-semibold! text-[#27427f]!">{summary.label}</span>
                  <span className="font-normal! text-gray-700!"> {summary.typeLabel}</span>
                </p>
              </div>

              <div className="px-5! py-4!">
                {summary.areaLabel && (
                  <>
                    <p className={LABEL}>{summary.areaLabel}</p>
                    <p className="text-sm! font-semibold! text-gray-900! tabular-nums! mt-1!">
                      {summary.areaValue}
                      {summary.areaSecondary && (
                        <span className="font-normal! text-gray-500!">
                          {" "}
                          {summary.areaSecondary}
                        </span>
                      )}
                    </p>
                  </>
                )}

                {priced ? (
                  <p className="text-xl! font-semibold! text-gray-900! tabular-nums! mt-4!">
                    {summary.priceLabel}
                  </p>
                ) : (
                  <p className="text-base! font-semibold! text-gray-900! mt-4!">
                    {summary.priceLabel}
                  </p>
                )}

                <p className="text-xs! text-gray-500! mt-1!">
                  {available > 0
                    ? `${available} unit${available === 1 ? "" : "s"} available`
                    : "Sold out"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
