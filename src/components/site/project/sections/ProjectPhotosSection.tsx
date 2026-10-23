"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { projectVideos } from "@/lib/youtube";
import { VideoTile } from "@/components/site/project/overview/VideoTile";
import { BODY, Card } from "@/components/site/project/project-ui";

/**
 * Full photo and video page. The overview only previews these, so everything
 * the overview leaves out lives here: every video, and every photo at a size
 * a buyer can actually judge. Tapping a photo opens the lightbox, which steps
 * through the set with the arrow keys as well as the buttons.
 */
const FOCUS_RING =
  "focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-offset-2!";

export function ProjectPhotosSection({ project }: { project: ProjectDetail }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videos = projectVideos(project);

  // Cover first, then the gallery, so the lightbox order matches the grid.
  const galleryImages = (project.galleryImageUrls ?? []).filter(
    Boolean,
  ) as string[];
  const allImages = [project.coverImageUrl, ...galleryImages].filter(
    Boolean,
  ) as string[];
  const altForImage = (src: string, index: number) =>
    (
      project as ProjectDetail & {
        galleryImageAltOverrides?: Record<string, string>;
      }
    ).galleryImageAltOverrides?.[src] || `${project.name} photo ${index + 1}`;
  const media =
    (
      project as ProjectDetail & {
        galleryImageSeo?: Record<
          string,
          { titleText?: string; caption?: string }
        >;
      }
    ).galleryImageSeo || {};
  const count = allImages.length;

  // The lock and key handlers only exist while the lightbox is open, so the
  // page scrolls normally the rest of the time.
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft")
        setCurrentIndex((i) => (i - 1 + count) % count);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, count]);

  if (count === 0 && videos.length === 0) {
    return (
      <Card title="Photos and videos">
        <p className={`${BODY} mt-6!`}>
          Photos for this project have not been published yet.
        </p>
      </Card>
    );
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {videos.length > 0 && (
        <Card title="Videos" id="videos">
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-x-4! gap-y-6! mt-6!">
            {videos.map((video, i) => (
              <VideoTile
                key={video.id}
                video={video}
                fallbackTitle={`${project.name} video${videos.length > 1 ? ` ${i + 1}` : ""}`}
              />
            ))}
          </div>
        </Card>
      )}

      {count > 0 && (
        <Card title={`Photos · ${count}`}>
          <div className="grid! grid-cols-2! md:grid-cols-3! gap-3! mt-6!">
            {allImages.map((src, idx) => (
              <figure key={`${src}-${idx}`} className="m-0! min-w-0!">
                <button
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className={`group aspect-[4/3]! rounded-xl! overflow-hidden! bg-gray-100! relative! cursor-pointer! ${FOCUS_RING}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={altForImage(src, idx)}
                    title={media[src]?.titleText}
                    loading="lazy"
                    draggable={false}
                    className="w-full! h-full! object-cover! transition-transform! duration-300! ease-out-quint! group-hover:scale-[1.03]!"
                  />
                </button>
                {media[src]?.caption && (
                  <figcaption className="mt-2! text-sm! text-gray-600!">
                    {media[src].caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Card>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} photos`}
          className="fixed! inset-0! z-[9999]! bg-white/95! backdrop-blur-xl! flex! items-center! justify-center!"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            className={`absolute! top-6! right-6! z-10! w-12! h-12! rounded-full! bg-gray-100! hover:bg-gray-200! grid! place-items-center! transition-colors! duration-150! ease-out-quint! ${FOCUS_RING}`}
          >
            <X className="w-6! h-6! text-gray-900!" aria-hidden="true" />
          </button>

          <div className="absolute! top-6! left-6! z-10! px-4! py-2! bg-gray-100! rounded-full!">
            <span className="text-gray-900! text-sm! font-medium! tabular-nums!">
              {currentIndex + 1} / {count}
            </span>
          </div>

          {media[allImages[currentIndex]]?.caption && <p className="text-white!">{media[allImages[currentIndex]].caption}</p>}
          {count > 1 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => (i - 1 + count) % count)}
              aria-label="Previous image"
              className={`absolute! left-6! z-10! w-12! h-12! rounded-full! bg-gray-100! hover:bg-gray-200! grid! place-items-center! transition-colors! duration-150! ease-out-quint! ${FOCUS_RING}`}
            >
              <ChevronLeft
                className="w-6! h-6! text-gray-900!"
                aria-hidden="true"
              />
            </button>
          )}

          <div className="max-w-[90vw]! max-h-[80vh]! grid! place-items-center!">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[currentIndex]}
              alt={altForImage(allImages[currentIndex], currentIndex)}
              title={media[allImages[currentIndex]]?.titleText}
              draggable={false}
              className="max-w-full! max-h-[80vh]! object-contain! rounded-xl! select-none! border! border-gray-200!"
            />
          </div>

          {count > 1 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => (i + 1) % count)}
              aria-label="Next image"
              className={`absolute! right-6! z-10! w-12! h-12! rounded-full! bg-gray-100! hover:bg-gray-200! grid! place-items-center! transition-colors! duration-150! ease-out-quint! ${FOCUS_RING}`}
            >
              <ChevronRight
                className="w-6! h-6! text-gray-900!"
                aria-hidden="true"
              />
            </button>
          )}

          {count > 1 && (
            <div className="absolute! bottom-6! left-1/2! -translate-x-1/2! flex! gap-2! max-w-[90vw]! overflow-x-auto! py-2! px-4! bg-white/70! backdrop-blur-xl! rounded-xl! hide-scrollbar border! border-gray-200!">
              {allImages.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Show photo ${idx + 1}`}
                  aria-current={idx === currentIndex}
                  className={`w-16! h-12! rounded-lg! overflow-hidden! shrink-0! border-2! transition-[opacity,border-color] duration-150! ease-out-quint! ${
                    idx === currentIndex
                      ? "border-gray-900! opacity-100!"
                      : "border-transparent! opacity-50! hover:opacity-100!"
                  } ${FOCUS_RING}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="w-full! h-full! object-cover!"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
