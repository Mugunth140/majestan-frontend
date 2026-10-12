import { Sofa, Sparkles } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { Card, Divider, EmptyState, Subheading } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  AMENITY_GRID,
  AmenityTile,
  CATEGORY_CHIP,
  amenityGroups,
  amenityList,
  categoryAnchor,
  type AmenityItem,
} from "@/components/site/project/overview/amenity-parts";
import {
  FurnishingStatus,
  configurationNote,
  projectFurnishing,
  type Furnishing,
} from "@/components/site/project/overview/furnishing-parts";

/**
 * The amenities and furnishing page. The overview previews both; this page
 * holds the full lists.
 *
 * Two jump tiles at the top say how much of each there is, since furnishing
 * otherwise sits below a long amenity list. Amenities follow in one card,
 * grouped by CRM category, each group keeping the anchor the overview's
 * category chips link to. Furnishing comes last, with each item naming the
 * configurations it comes with when the units differ. Plots have nothing to
 * furnish, so their page is the amenities card alone.
 */
export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  const amenities = amenityList(project);
  const furnishing = projectFurnishing(project);

  if (!furnishing) return <AmenitiesCard project={project} items={amenities} />;

  return (
    <>
      <nav aria-label="On this page" className="grid! grid-cols-1! sm:grid-cols-2! gap-3!">
        <JumpTile href="#amenities" {...amenitiesSummary(amenities)} />
        <JumpTile href="#furnishing" {...furnishingSummary(furnishing)} />
      </nav>
      <AmenitiesCard project={project} items={amenities} />
      <FurnishingCard project={project} furnishing={furnishing} />
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

/** A count and what it covers, linking down to its card. */
function JumpTile({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <a
      href={href}
      className="block! rounded-[20px]! bg-white! border! border-gray-200/70! shadow-sm! p-4! sm:p-5! no-underline! transition-[border-color,box-shadow]! duration-150! ease-out-quint! hover:border-[#27427f]/30! hover:shadow-md! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
    >
      <span className="block! text-base! font-semibold! text-gray-900! tabular-nums!">{title}</span>
      <span className="block! mt-0.5! text-sm! text-gray-500! truncate!">{detail}</span>
    </a>
  );
}

/**
 * Every amenity in one card. With more than one category, chips at the top
 * jump to each group, and the groups run down the card under rules.
 */
function AmenitiesCard({ project, items }: { project: ProjectDetail; items: AmenityItem[] }) {
  if (items.length === 0) {
    return (
      <Card title="Amenities" id="amenities">
        <EmptyState
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
      </Card>
    );
  }

  const groups = amenityGroups(items);
  const grouped = groups.length > 1;

  return (
    <Card
      title="Amenities"
      id="amenities"
    >
      {grouped && (
        <nav aria-label="Amenity categories" className="mt-4! flex! flex-wrap! gap-2!">
          {groups.map(([title, list]) => (
            <a key={title} href={`#${categoryAnchor(title)}`} className={CATEGORY_CHIP}>
              {title}
              <span className="text-gray-500! tabular-nums!">{list.length}</span>
            </a>
          ))}
        </nav>
      )}

      {groups.map(([title, list]) => (
        <div key={title} id={categoryAnchor(title)} className="scroll-mt-32!">
          {grouped ? (
            <>
              <Divider />
              <Subheading>{title}</Subheading>
            </>
          ) : null}
          <div className={`${AMENITY_GRID} ${grouped ? "mt-4!" : "mt-6!"}`}>
            {list.map((item) => (
              <AmenityTile key={item.key} name={item.name} Icon={item.Icon} />
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

/**
 * What comes fitted. The state first ("Semi Furnished"), then the items.
 * When the units differ, each item names the configurations it comes with,
 * so a buyer comparing a 2 BHK and a 3 BHK reads the difference here rather
 * than opening every floor plan.
 */
function FurnishingCard({
  project,
  furnishing,
}: {
  project: ProjectDetail;
  furnishing: Furnishing;
}) {
  const { items, varies, sharedStatus } = furnishing;

  return (
    <Card
      title="Furnishing"
      id="furnishing"
    >
      <FurnishingStatus furnishing={furnishing} />

      {items.length > 0 ? (
        <>
          <div className={`${AMENITY_GRID} mt-6!`}>
            {items.map((item) => (
              <AmenityTile
                key={item.key}
                name={item.name}
                Icon={item.Icon}
                note={varies ? configurationNote(item, furnishing) : undefined}
              />
            ))}
          </div>
          {varies && (
            <p className="text-sm! text-gray-500! mt-4! text-pretty!">
              Furnishing differs between units, so each item names the configurations that include
              it. Confirm the list for a specific unit before you book.
            </p>
          )}
        </>
      ) : (
        // An unfurnished handover is a complete answer on its own.
        sharedStatus !== "Unfurnished" && (
          <EmptyState
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
    </Card>
  );
}
