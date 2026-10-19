import type { ProjectDetail } from "@/lib/api/projects";
import { Images } from "lucide-react";
import { Panel, PanelEmpty, PanelLink } from "@/components/site/project/overview/overview-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { projectVideos } from "@/lib/youtube";
import { MediaShowcase } from "@/components/site/project/overview/MediaShowcase";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * Overview preview of the project's media: a photo mosaic and the videos,
 * behind one switch (see MediaShowcase).
 *
 * With no video and nothing beyond the cover, the card says so and offers
 * to send site photos: the cover is already the hero, so repeating it here
 * as the only tile would look like the gallery failed to load.
 */
export function MediaPreview({ project }: { project: ProjectDetail }) {
  const slug = project.canonicalSlug;

  const videos = projectVideos(project);
  const gallery = (project.galleryImageUrls ?? []).filter(Boolean) as string[];

  if (videos.length === 0 && gallery.length === 0) {
    const hasCover = Boolean(project.coverImageUrl);
    return (
      <Panel
        title="Photos and videos"
        id="photos"
        action={
          hasCover ? <PanelLink href={`/${slug}/photos`}>View all</PanelLink> : undefined
        }
      >
        <PanelEmpty
          icon={Images}
          title={hasCover ? "Only the cover photo is published" : "No photos or videos yet"}
          body="Ask for recent site photos or a walkthrough video."
          action={
            <RequestButton
              label="Request site photos"
              message={`Please send recent site photos or a walkthrough video of ${project.name}.`}
            />
          }
        />
      </Panel>
    );
  }

  const photos = [project.coverImageUrl, ...gallery].filter(Boolean) as string[];
  const placeholder = getPlaceholderImage({ projectType: project.projectType });
  return (
    <Panel
      title="Photos and videos"
      id="photos"
      meta={[
        photos.length > 0 ? `${photos.length} ${plural(photos.length, "photo", "photos")}` : null,
        videos.length > 0 ? `${videos.length} ${plural(videos.length, "video", "videos")}` : null,
      ].filter(Boolean).join(" · ")}
      action={<PanelLink href={`/${slug}/photos`}>Open gallery</PanelLink>}
    >
      <MediaShowcase
        slug={slug}
        name={project.name}
        photos={photos}
        photoAltOverrides={(
          project as ProjectDetail & { galleryImageAltOverrides?: Record<string, string> }
        ).galleryImageAltOverrides}
        videos={videos}
        placeholder={placeholder}
      />
    </Panel>
  );
}
