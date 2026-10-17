"use client";

import { useState } from "react";
import { Bath, BedDouble, BookOpen, Building2, CalendarClock, Car, CarFront, Compass, Fence, FileCheck, Flame, Hash, Home, LandPlot, Layers, MapPin, Maximize, Ruler, Sofa, Tag, Wallet, Warehouse, type LucideIcon } from "lucide-react";
import type { DetailGroup } from "@/lib/property-detail-groups";
import { INK, TOGGLE } from "@/components/site/project/overview/overview-ui";

const ICONS: Record<string, LucideIcon> = {
  "project type": Home, "property type": Home, "unit type": Home,
  "project name": Building2, "developer": Building2, "builder": Building2,
  "project id": Tag, "property id": Tag, "total units": Hash, "units on sale": Warehouse,
  "towers": Building2, "floors per tower": Layers, "floor": Layers, "floors": Layers,
  "bedrooms": BedDouble, "bathrooms": Bath, "balconies": Ruler,
  "furnishing": Sofa, "pooja room": Flame, "study room": BookOpen,
  "project area": Maximize, "uds area": LandPlot, "guest parking": CarFront, "boundary wall": Fence,
};

function detailIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (ICONS[key]) return ICONS[key];
  if (/parking/.test(key)) return Car;
  if (/area|dimension|width|length/.test(key)) return Ruler;
  if (/facing/.test(key)) return Compass;
  if (/date|available|listed|possession|handover/.test(key)) return CalendarClock;
  if (/price|value|amount|deposit|maintenance|rent|charges|payment/.test(key)) return Wallet;
  if (/approval|rera|legal|ownership/.test(key)) return FileCheck;
  if (/road|location|connectivity/.test(key)) return MapPin;
  if (/plot|land|boundary|open sides/.test(key)) return LandPlot;
  if (/floor|building/.test(key)) return Layers;
  return Tag;
}

/** Readable categories with quiet labels and a clear emphasis on each value. */
export function GroupedDetails({ groups, id, previewGroups = 2, headingLevel = 3 }: {
  groups: DetailGroup[];
  id: string;
  previewGroups?: number;
  headingLevel?: 3 | 4;
}) {
  const [expanded, setExpanded] = useState(false);
  const Heading = headingLevel === 4 ? "h4" : "h3";
  if (!groups.length) return null;

  return (
    <>
      <div id={id} className="mt-6!">
        {groups.map((group, index) => {
          const CategoryIcon = detailIcon(group.fields[0]?.label ?? group.title);
          return (
          <section key={group.title} aria-labelledby={`${id}-${index}`} hidden={!expanded && index >= previewGroups}
            className={`border-t! border-solid! border-[var(--ov-line)]! py-4! ${!expanded && index >= previewGroups ? "hidden!" : ""}`}>
            <Heading id={`${id}-${index}`} className="m-0! flex! items-center! gap-2! text-[16px]! font-semibold! leading-snug! tracking-normal! text-black!">
              <div className="flex! items-center! justify-center! rounded-full! bg-[#e0e7ff]! p-2!">
              <CategoryIcon aria-hidden="true" className="h-4! w-4! shrink-0! text-[#1645bf]!" strokeWidth={1.75} />
              </div>
              {group.title}
            </Heading>
            <dl className="m-0! mt-4! grid! grid-cols-1! sm:grid-cols-2! gap-x-8! gap-y-4!">
              {group.fields.map((field) => (
                <div key={field.label} className={`min-w-0! ${field.wide ? "sm:col-span-2!" : ""}`}>
                  <dt className="m-0! text-[14px]! font-normal! normal-case! tracking-normal! leading-snug! text-[#475569]!">{field.label}</dt>
                  <dd className={`m-0! mt-1! text-[13px]! font-medium! leading-relaxed! break-words! whitespace-pre-line! ${INK}`}>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          );
        })}
      </div>
      {groups.length > previewGroups && (
        <button type="button" aria-controls={id} aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)} className={`${TOGGLE} mt-2!`}>
          {expanded ? "Show less" : "View all details"}
        </button>
      )}
    </>
  );
}
