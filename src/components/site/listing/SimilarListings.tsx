import { getSimilarProjects, getSimilarProperties } from "@/lib/api/similar";
import { SimilarListingsSection } from "@/components/site/listing/SimilarListingsSection";

/*
 * "Similar …" rails for property and project pages, between the page's last
 * panel ("Need more details?" / "Need some help?") and the footer's Popular
 * Searches. Server components: they fetch the ranked list and hand it to the
 * client section. Nothing renders when nothing is similar.
 */

export async function SimilarProperties({ propertyId }: { propertyId: number; city?: string | null }) {
  const items = await getSimilarProperties(propertyId);
  return <SimilarListingsSection kind="property" items={items} />;
}

export async function SimilarProjects({ projectId }: { projectId: number; city?: string | null }) {
  const items = await getSimilarProjects(projectId);
  return <SimilarListingsSection kind="project" items={items} />;
}
