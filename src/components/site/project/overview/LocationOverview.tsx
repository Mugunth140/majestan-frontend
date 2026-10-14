import type { ProjectDetail } from "@/lib/api/projects";
import { MapPinned } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import { getLocalityDescription } from "@/lib/api/localities";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import { visibleConnectivity, visibleNearby } from "@/components/site/project/overview/location-parts";
import { NearbyExplorer } from "@/components/site/project/overview/NearbyExplorer";
import {
  INK,
  IconMark,
  MUTED,
  PROSE,
  Panel,
  PanelEmpty,
  PanelLink,
} from "@/components/site/project/overview/overview-ui";

/**
 * Overview preview of the location: the locality write-up, the travel times
 * that matter, and the nearest places by category. The locality sub-page
 * holds the rest, including the map, which is why its link always shows.
 * The write-up is read on the server, so an empty section can say it is empty.
 */
export async function LocationOverview({ project }: { project: ProjectDetail }) {
  const connectivity = visibleConnectivity(project.connectivity).slice(0, 4);
  const nearby = visibleNearby(project.nearbyCategories).slice(0, 6);
  const about = await getLocalityDescription(project.sublocation, project.city);
  const empty = !about && connectivity.length === 0 && nearby.length === 0;
  const place = [project.sublocation, project.city].filter(Boolean).join(", ");

  return (
    <Panel
      title="Location"
      id="location"
      tint
      meta={place || undefined}
      action={<PanelLink href={`/${project.canonicalSlug}/locality`}>Explore the locality</PanelLink>}
    >
      {empty && (
        <PanelEmpty
          icon={MapPinned}
          title="Connectivity details aren't published yet"
          body="See it on the map, or ask how it connects to schools, offices and transport."
          action={
            <RequestButton
              label="Ask about the area"
              message={`How well connected is ${project.name}? Nearest schools, offices and transport?`}
            />
          }
        />
      )}

      {about && (
        <p className={`m-0! mt-5! ${PROSE} line-clamp-3!`}>
          <span className={`font-semibold! ${INK}`}>{about.name}. </span>
          {about.description}
        </p>
      )}

      {/* Travel times lead with the time, since that is what is compared. */}
      {connectivity.length > 0 && (
        <ul className="m-0! mt-6! p-0! list-none! grid! grid-cols-1! min-[480px]:grid-cols-2! gap-x-6! gap-y-4!">
          {connectivity.map((row, index) => (
            <li key={`${row.label ?? ""}-${row.detail ?? ""}-${index}`} className="flex! items-center! gap-3! min-w-0!">
              <IconMark Icon={connectivityIconFor(row.icon)} />
              <span className="min-w-0!">
                {row.detail && (
                  <span className={`block! text-base! font-semibold! tracking-[-0.01em]! tabular-nums! ${INK}`}>
                    {row.detail}
                  </span>
                )}
                {row.label && <span className={`block! text-[13px]! ${MUTED}`}>{row.label}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {nearby.length > 0 && (
        <div className="mt-8!">
          <h3 className={`m-0! mb-3! text-base! font-semibold! ${INK}`}>What&rsquo;s nearby</h3>
          <NearbyExplorer categories={nearby} placesPerCategory={5} />
        </div>
      )}
    </Panel>
  );
}
