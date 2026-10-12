import Link from "next/link";
import type { ProjectDetail } from "@/lib/api/projects";
import { Images } from "lucide-react";
import { Card, EmptyState, TEXT_LINK, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { projectVideos } from "@/lib/youtube";
import { VideoTile } from "@/components/site/project/overview/VideoTile";

/** Tiles on a desktop row. Phones show three, so the fourth is hidden below sm. */
const TILES = 4;
const PHONE_TILES = 3;

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * Overview preview of the project's media. The first video plays in place
 * and the photos are a small row. Every tile links to the photos sub-page,
 * since the lightbox lives there, not here.
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
      <Card
        title="Photos and videos"
        id="photos"
        action={
          hasCover ? <ViewAllLink href={`/${slug}/photos`}>View all</ViewAllLink> : undefined
        }
      >
        <EmptyState
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
      </Card>
    );
  }

  const photos = [project.coverImageUrl, ...gallery].filter(Boolean) as string[];
  const placeholder = getPlaceholderImage({ projectType: project.projectType });
  const [leadVideo, ...otherVideos] = videos;
  // The lead plays large; up to two more sit beneath it, so a project with a
  // walkthrough and a couple of amenity clips shows all three here.
  const shownOthers = otherVideos.slice(0, 2);
  const hiddenVideos = otherVideos.length - shownOthers.length;
  const showPhotoRow = gallery.length > 0;
  const shown = photos.slice(0, TILES);

  return (
    <Card
      title="Photos and videos"
      id="photos"
      action={<ViewAllLink href={`/${slug}/photos`}>View all</ViewAllLink>}
    >
      {leadVideo && (
        <div className="mt-6! flex! flex-col! gap-6!">
          <VideoTile video={leadVideo} fallbackTitle={`${project.name} video`} size="lead" />
          {shownOthers.length > 0 && (
            <div className="grid! grid-cols-1! sm:grid-cols-2! gap-x-4! gap-y-6!">
              {shownOthers.map((video, index) => (
                <VideoTile
                  key={video.id}
                  video={video}
                  fallbackTitle={`${project.name} video ${index + 2}`}
                />
              ))}
            </div>
          )}
          {hiddenVideos > 0 && (
            <Link
              href={`/${slug}/photos#videos`}
              className={`self-start! text-sm! font-medium! ${TEXT_LINK}`}
            >
              +{hiddenVideos} more {plural(hiddenVideos, "video", "videos")}
            </Link>
          )}
        </div>
      )}

      {showPhotoRow && (
        <div className="grid! grid-cols-3! sm:grid-cols-4! gap-3! mt-6!">
          {shown.map((src, i) => (
            <Link
              key={`${src}-${i}`}
              href={`/${slug}/photos`}
              className={`group aspect-[4/3]! rounded-xl! overflow-hidden! bg-gray-100! relative! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! ${
                i >= PHONE_TILES ? "hidden! sm:block!" : ""
              }`}
            >
              {/* The zoom sits on a wrapper: on the image itself its transition
                  would replace ListingImage's own fade-in. */}
              <span className="block! w-full! h-full! transition-transform! duration-300! ease-out-quint! group-hover:scale-[1.03]!">
                <ListingImage
                  src={src}
                  placeholderSrc={placeholder}
                  alt={`${project.name} photo ${i + 1}`}
                  className="w-full! h-full! object-cover!"
                />
              </span>
              {/* The phone row ends at the third tile and the desktop row at
                  the fourth, so each breakpoint gets its own remainder count. */}
              {i === PHONE_TILES - 1 && photos.length > PHONE_TILES && (
                <span className="sm:hidden! absolute! inset-0! bg-gray-900/60! grid! place-items-center! text-white! text-sm! font-semibold!">
                  +{photos.length - PHONE_TILES} {plural(photos.length - PHONE_TILES, "photo", "photos")}
                </span>
              )}
              {i === TILES - 1 && photos.length > TILES && (
                <span className="hidden! sm:grid! absolute! inset-0! bg-gray-900/60! place-items-center! text-white! text-sm! font-semibold!">
                  +{photos.length - TILES} {plural(photos.length - TILES, "photo", "photos")}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
