import type { ProjectDetail } from "@/lib/api/projects";
import { MapPinned } from "lucide-react";
import { BODY, Card, EmptyState, Subheading, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { getLocalityDescription } from "@/lib/api/localities";
import {
  ConnectivityGrid,
  NearbyPlaces,
  visibleConnectivity,
  visibleNearby,
} from "@/components/site/project/overview/location-parts";

/**
 * Overview preview of the location: the locality write-up, a few
 * connectivity highlights and the nearest places. The locality sub-page
 * holds the rest, including the map, which is why its link always shows.
 * The write-up is read on the server, so an empty card can say it is empty.
 */
export async function LocationOverview({ project }: { project: ProjectDetail }) {
  const connectivity = visibleConnectivity(project.connectivity);
  const nearby = visibleNearby(project.nearbyCategories);
  const about = await getLocalityDescription(project.sublocation, project.city);
  const empty = !about && connectivity.length === 0 && nearby.length === 0;
  const place = [project.sublocation, project.city].filter(Boolean).join(", ");

  return (
    <Card
      title="Location"
      id="location"
      action={
        <ViewAllLink href={`/${project.canonicalSlug}/locality`}>Explore the locality</ViewAllLink>
      }
    >
      {empty && (
        <EmptyState
          icon={MapPinned}
          title={place ? `In ${place}` : "Connectivity details aren't published yet"}
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
        <div className="mt-6!">
          <Subheading>About {about.name}</Subheading>
          <p className={`mt-2! ${BODY} line-clamp-3! text-pretty!`}>{about.description}</p>
        </div>
      )}

      {connectivity.length > 0 && (
        <div className="mt-6!">
          <Subheading>Connectivity highlights</Subheading>
          <div className="mt-4!">
            <ConnectivityGrid items={connectivity} limit={4} />
          </div>
        </div>
      )}

      {nearby.length > 0 && (
        <div className="mt-6!">
          <Subheading>Nearby places</Subheading>
          <div className="mt-4!">
            <NearbyPlaces categories={nearby} maxCategories={4} placesPerCategory={3} />
          </div>
        </div>
      )}
    </Card>
  );
}
