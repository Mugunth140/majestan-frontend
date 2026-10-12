import { YouTubeFacade } from "@/components/site/project/overview/YouTubeFacade";
import type { ProjectVideo } from "@/lib/youtube";

/**
 * A video and the title the editor gave it in the CRM. Untitled videos (from
 * before titles existed) show no caption rather than a made-up one; the
 * player still gets a descriptive accessible name.
 */
export function VideoTile({
  video,
  fallbackTitle,
  size = "regular",
}: {
  video: ProjectVideo;
  fallbackTitle: string;
  size?: "lead" | "regular";
}) {
  return (
    <figure className="m-0! min-w-0!">
      <YouTubeFacade videoId={video.id} title={video.title ?? fallbackTitle} />
      {video.title && (
        <figcaption
          className={`mt-3! font-semibold! text-gray-900! text-pretty! ${
            size === "lead" ? "text-base!" : "text-sm!"
          }`}
        >
          {video.title}
        </figcaption>
      )}
    </figure>
  );
}
