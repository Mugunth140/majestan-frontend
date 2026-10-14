"use client";

import { useState } from "react";
import { ArrowDown, Search, Sofa, Sparkles, X } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  amenityGroups,
  amenityList,
  categoryAnchor,
  type AmenityItem,
} from "@/components/site/project/overview/amenity-parts";
import {
  projectFurnishing,
  type Furnishing,
} from "@/components/site/project/overview/furnishing-parts";
import {
  FOCUS_RING,
  HAIRLINE,
  INK,
  IconMark,
  MUTED,
  Panel,
  PanelEmpty,
  chipClass,
  swapClass,
} from "@/components/site/project/overview/overview-ui";

/**
 * The amenities and furnishing page. The overview previews both; this page
 * holds the full lists, made to be searched and compared rather than read
 * top to bottom.
 *
 * Two summary tiles lead, since furnishing otherwise sits below a long
 * amenity list. Amenities can be searched by name or narrowed to a category;
 * each category keeps the anchor older links point at. Furnishing can be
 * viewed per configuration, which greys out what that configuration lacks.
 * Plots have nothing to furnish, so their page is the amenities alone.
 */
export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  const amenities = amenityList(project);
  const furnishing = projectFurnishing(project);

  if (!furnishing) return <AmenitiesPanel project={project} items={amenities} />;

  return (
    <>
      <nav aria-label="On this page" className="grid! grid-cols-1! sm:grid-cols-2! gap-3!">
        <JumpTile href="#amenities" Icon={Sparkles} {...amenitiesSummary(amenities)} />
        <JumpTile href="#furnishing" Icon={Sofa} {...furnishingSummary(furnishing)} />
      </nav>
      <AmenitiesPanel project={project} items={amenities} />
      <FurnishingPanel project={project} furnishing={furnishing} />
    </>
  );
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function amenitiesSummary(items: AmenityItem[]): { title: string; detail: string } {
  if (items.length === 0) return { title: "Amenities", detail: "Not listed yet" };
  const groups = amenityGroups(items).length;
  return {
    title: plural(items.length, "amenity", "amenities"),
    detail: groups > 1 ? `Across ${groups} categories` : "Facilities and services",
  };
}

function furnishingSummary(furnishing: Furnishing): { title: string; detail: string } {
  const { items, varies, sharedStatus } = furnishing;
  if (items.length === 0) return { title: "Furnishing", detail: sharedStatus ?? "Not listed yet" };
  return {
    title: plural(items.length, "furnishing item", "furnishing items"),
    detail: sharedStatus ?? (varies ? "Varies by configuration" : "Included in every unit"),
  };
}

/** A count and what it covers, linking down to its section. */
function JumpTile({
  href,
  Icon,
  title,
  detail,
}: {
  href: string;
  Icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <a
      href={href}
      className={`group/jump flex! items-center! gap-4! rounded-2xl! border! border-[#dfe7f4]! bg-[linear-gradient(135deg,#fff_0%,#fff_45%,#eef4ff_100%)]! p-4! sm:p-5! no-underline! transition-[border-color,box-shadow,transform]! duration-200! ease-out-quint! hover:-translate-y-0.5! hover:border-[#bcd0f7]! hover:shadow-[0_14px_30px_-20px_rgba(22,69,191,0.4)]! ${FOCUS_RING}`}
    >
      <IconMark Icon={Icon} />
      <span className="min-w-0! flex-1!">
        <span className={`block! text-base! font-semibold! tabular-nums! ${INK}`}>{title}</span>
        <span className={`block! mt-0.5! text-sm! truncate! ${MUTED}`}>{detail}</span>
      </span>
      <ArrowDown
        aria-hidden="true"
        className="w-4! h-4! shrink-0! text-[var(--ov-muted)]! transition-[transform,color]! duration-200! group-hover/jump:translate-y-0.5! group-hover/jump:text-[var(--ov-blue)]!"
      />
    </a>
  );
}

const ALL = "All";

/**
 * Every amenity, grouped by CRM category. A search box narrows by name and
 * the chips narrow to one category; both work together.
 */
function AmenitiesPanel({ project, items }: { project: ProjectDetail; items: AmenityItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  if (items.length === 0) {
    return (
      <Panel title="Amenities" id="amenities">
        <PanelEmpty
          icon={Sparkles}
          title="Amenities aren't listed yet"
          body="Ask for the full list of shared facilities and services."
          action={
            <RequestButton
              label="Request amenity list"
              message={`Please share the full amenity list for ${project.name}.`}
            />
          }
        />
      </Panel>
    );
  }

  const groups = amenityGroups(items);
  const grouped = groups.length > 1;
  const needle = query.trim().toLowerCase();
  const visible = groups
    .filter(([title]) => category === ALL || title === category)
    .map(([title, list]) => [title, list.filter((item) => item.name.toLowerCase().includes(needle))] as const)
    .filter(([, list]) => list.length > 0);
  const matches = visible.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <Panel
      title="Amenities"
      id="amenities"
      meta={`${plural(items.length, "amenity", "amenities")}${grouped ? ` in ${groups.length} categories` : ""}`}
    >
      <div className="mt-5! flex! flex-col! gap-3! md:flex-row! md:items-center!">
        {items.length > 6 && (
          <label className="relative! block! md:w-64! md:shrink-0!">
            <span className="sr-only">Search amenities</span>
            <Search aria-hidden="true" className="pointer-events-none! absolute! left-3.5! top-1/2! -translate-y-1/2! w-4! h-4! text-[var(--ov-muted)]!" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search amenities"
              className="w-full! rounded-full! border! border-[var(--ov-line-strong)]! bg-white! py-2! pl-10! pr-9! text-sm! text-[var(--ov-ink)]! outline-none! transition-[border-color,box-shadow]! duration-150! placeholder:text-[var(--ov-muted)]! focus:border-[#9dbbf3]! focus:shadow-[0_0_0_3px_#eef4ff]! [&::-webkit-search-cancel-button]:hidden!"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute! right-2! top-1/2! -translate-y-1/2! grid! place-items-center! w-6! h-6! rounded-full! border-0! bg-[#f2f4f8]! text-[var(--ov-muted)]! cursor-pointer! hover:text-[var(--ov-ink)]!"
              >
                <X className="w-3.5! h-3.5!" />
              </button>
            )}
          </label>
        )}
        {grouped && (
          <div role="group" aria-label="Amenity categories" className="hide-scrollbar -mx-1! flex! gap-2! overflow-x-auto! px-1! py-1!">
            {[[ALL, items] as const, ...groups].map(([title, list]) => {
              const selected = category === title;
              return (
                <button
                  key={title}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(title)}
                  className={chipClass(selected)}
                >
                  {title}
                  <span className={`tabular-nums! ${selected ? "text-[var(--ov-blue)]!" : "text-[var(--ov-muted)]!"}`}>
                    {list.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div key={`${category}-${needle}`} className={swapClass}>
        {matches === 0 ? (
          <PanelEmpty
            icon={Search}
            title={`No amenity matches “${query.trim()}”`}
            body="It may still be on site under another name. Ask and we'll check."
            action={
              <RequestButton
                label="Ask about it"
                message={`Does ${project.name} have ${query.trim()}?`}
              />
            }
          />
        ) : (
          visible.map(([title, list]) => (
            <section key={title} id={categoryAnchor(title)} aria-label={title} className="mt-7! scroll-mt-32!">
              {grouped && (
                <div className={`mb-4! flex! items-baseline! justify-between! gap-4! border-b! pb-2.5! ${HAIRLINE}`}>
                  <h3 className={`m-0! text-base! font-semibold! ${INK}`}>{title}</h3>
                  <span className={`text-[13px]! tabular-nums! ${MUTED}`}>{list.length}</span>
                </div>
              )}
              <ul className="m-0! p-0! list-none! grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-x-4! gap-y-5!">
                {list.map((item) => (
                  <li key={item.key} className="flex! items-center! gap-3! min-w-0!">
                    <IconMark Icon={item.Icon} />
                    <span className={`min-w-0! text-sm! font-medium! leading-snug! break-words! ${INK}`}>{item.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </Panel>
  );
}

const EVERY = "All configurations";

/**
 * What comes fitted. When units differ, a switch per configuration shows
 * that configuration's list, greying out what it doesn't include, so a buyer
 * comparing a 2 BHK and a 3 BHK sees the difference in place.
 */
function FurnishingPanel({ project, furnishing }: { project: ProjectDetail; furnishing: Furnishing }) {
  const { items, varies, sharedStatus, configurations } = furnishing;
  const [view, setView] = useState(EVERY);
  const picked = configurations.find((c) => c.label === view) ?? null;
  const included = items.filter((item) => !picked || item.configurations.includes(picked.label)).length;

  const meta = picked
    ? [picked.status, `${included} of ${items.length} items`].filter(Boolean).join(" · ")
    : [sharedStatus, items.length > 0 ? plural(items.length, "item", "items") : null].filter(Boolean).join(" · ");

  return (
    <Panel title="Furnishing" id="furnishing" tint meta={meta || undefined}>
      {/* The furnishing state, always stated: "Semi Furnished". */}
      <dl className="m-0! mt-4! flex! flex-wrap! gap-2!">
        {(sharedStatus
          ? [{ key: "all", label: configurations.length > 1 ? EVERY : configurations[0].label, status: sharedStatus }]
          : configurations.flatMap((c) => (c.status ? [{ key: c.key, label: c.label, status: c.status }] : []))
        ).map((row) => (
          <div key={row.key} className="inline-flex! items-center! gap-2! rounded-full! bg-white! px-3! py-1! text-sm! ring-1! ring-[#e3ebf8]!">
            <dt className={`font-normal! ${MUTED}`}>{row.label}</dt>
            <dd className="m-0! font-semibold! text-[var(--ov-blue-deep)]!">{row.status}</dd>
          </div>
        ))}
      </dl>

      {items.length > 0 ? (
        <>
          {varies && configurations.length > 1 && (
            <div role="group" aria-label="Compare configurations" className="hide-scrollbar -mx-1! mt-5! flex! gap-2! overflow-x-auto! px-1! py-1!">
              {[EVERY, ...configurations.map((c) => c.label)].map((label) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={view === label}
                  onClick={() => setView(label)}
                  className={chipClass(view === label)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <ul key={view} className={`${swapClass} m-0! mt-6! p-0! list-none! grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-x-4! gap-y-5!`}>
            {items.map((item) => {
              const has = !picked || item.configurations.includes(picked.label);
              const note = varies && !picked ? configurationNote(item.configurations, configurations.length) : null;
              return (
                <li key={item.key} className={`flex! items-center! gap-3! min-w-0! transition-opacity! duration-200! ${has ? "" : "opacity-40!"}`}>
                  <IconMark Icon={item.Icon} />
                  <span className="min-w-0!">
                    <span className={`block! text-sm! font-medium! leading-snug! break-words! ${INK} ${has ? "" : "line-through! decoration-[var(--ov-muted)]!"}`}>
                      {item.name}
                    </span>
                    {note && <span className={`block! mt-0.5! text-xs! ${MUTED}`}>{note}</span>}
                    {!has && <span className={`block! mt-0.5! text-xs! ${MUTED}`}>Not in {picked!.label}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          {varies && (
            <p className={`m-0! mt-5! text-sm! text-pretty! ${MUTED}`}>
              Furnishing differs between units. Pick a configuration to see its list, and confirm it
              for a specific unit before you book.
            </p>
          )}
        </>
      ) : (
        // An unfurnished handover is a complete answer on its own.
        sharedStatus !== "Unfurnished" && (
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
        )
      )}
    </Panel>
  );
}

/** "2 BHK, 3 BHK", or "All configurations" when every one carries it. */
function configurationNote(labels: string[], total: number): string {
  return labels.length === total ? EVERY : labels.join(", ");
}
