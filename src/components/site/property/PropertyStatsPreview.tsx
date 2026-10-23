"use client";
import { useState, type ReactNode } from "react";
import { EYEBROW, INK } from "@/components/site/project/overview/overview-ui";
import { TEXT_LINK } from "@/components/site/project/project-ui";

export function PropertyStatsPreview({ stats }: { stats: { label: string; value: ReactNode; icon: ReactNode; wide?: boolean }[] }) {
  const [showAllPropertyDetails, setShowAllPropertyDetails] = useState(false);
  return <>
              <div
                id="property-details-grid"
                className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! sm:grid-cols-3! gap-x-4! gap-y-6!"
              >
                {stats.map((stat, index) => {
                  const collapsedVisibility = showAllPropertyDetails
                    ? ""
                    : index >= 6
                      ? "hidden!"
                      : index >= 4
                        ? "hidden! sm:flex!"
                        : "";
                  return (
                    <div
                      key={stat.label}
                      className={`flex! items-start! gap-3! min-w-0! ${stat.wide ? "col-span-2! sm:col-span-3!" : ""} ${collapsedVisibility}`}
                    >
                      <div className="w-8! h-8! rounded-lg! bg-[#eef4ff]! flex! items-center! justify-center! text-[#1645bf]! shrink-0!">
                        {stat.icon}
                      </div>
                      <div className="min-w-0!">
                        <p className={`m-0! ${EYEBROW}`}>{stat.label}</p>
                        <p
                          className={`m-0! text-[15px]! font-semibold! ${INK} mt-0.5! leading-snug! break-words! ${stat.wide ? "whitespace-pre-line!" : ""}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {stats.length > 4 && (
                <button
                  type="button"
                  aria-controls="property-details-grid"
                  aria-expanded={showAllPropertyDetails}
                  onClick={() => setShowAllPropertyDetails((show) => !show)}
                  className={`${TEXT_LINK} mt-5! inline-flex! text-sm! font-semibold! sm:hidden!`}
                >
                  {showAllPropertyDetails ? "Show less" : "View more"}
                </button>
              )}
              {stats.length > 6 && (
                <button
                  type="button"
                  aria-controls="property-details-grid"
                  aria-expanded={showAllPropertyDetails}
                  onClick={() => setShowAllPropertyDetails((show) => !show)}
                  className={`${TEXT_LINK} mt-5! hidden! text-sm! font-semibold! sm:inline-flex!`}
                >
                  {showAllPropertyDetails ? "Show less" : "View more"}
                </button>
              )}
  </>;
}
