import type { ProjectDetail } from "@/lib/api/projects";
import { LocalityInteractiveMap } from "@/components/site/locality/LocalityInteractiveMap";
import { getLocalityDescription } from "@/lib/api/localities";
import { BODY, Card, paragraphs } from "@/components/site/project/project-ui";
import { projectCoordinates } from "@/lib/project-overview";
import {
  ConnectivityGrid,
  NearbyPlaces,
  visibleConnectivity,
  visibleNearby,
} from "@/components/site/project/overview/location-parts";

/**
 * Locality sub-page. The overview shows a trimmed version of the same lists,
 * built by the same helpers, so the two pages cannot disagree on a fact.
 */
export async function ProjectLocalitySection({ project }: { project: ProjectDetail }) {
  const place = [project.sublocation, project.city].filter(Boolean).join(", ");
  const label = place || project.name;
  const coords = projectCoordinates(project);
  const connectivity = visibleConnectivity(project.connectivity);
  const nearby = visibleNearby(project.nearbyCategories);
  const about = await getLocalityDescription(project.sublocation, project.city);

  return (
    <div className="flex! flex-col! gap-6!">
      {/* Only when there is a write-up: the address is already in the title
          row above, so a card holding just the address would repeat it. */}
      {about && (
        <Card title={`About ${about.name}`} id="about-locality">
          <div className="mt-4! flex! flex-col! gap-4!">
            {paragraphs(about.description).map((block, index) => (
              <p key={index} className={`${BODY} text-pretty!`}>
                {block}
              </p>
            ))}
          </div>
        </Card>
      )}

      {connectivity.length > 0 && (
        <Card title="Connectivity highlights" id="connectivity">
          <div className="mt-6!">
            <ConnectivityGrid items={connectivity} />
          </div>
        </Card>
      )}

      {nearby.length > 0 && (
        <Card title="Nearby places" id="nearby">
          <div className="mt-6!">
            <NearbyPlaces categories={nearby} />
          </div>
        </Card>
      )}

      {place && (
        <Card title="On the Maps" id="map">
          <div className="mt-6! rounded-2xl! overflow-hidden! border! border-gray-200!">
            <LocalityInteractiveMap
              query={coords ? `${coords.lat},${coords.lon}` : place}
              label={label}
              height={360}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
