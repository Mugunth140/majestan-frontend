"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { possessionTone, projectTypeLabel, titleCase } from "@/lib/project-overview";
import type { ProjectDetail } from "@/lib/api/projects";

/** How many thumbnails earn their place before the strip becomes a scroller. */
const THUMB_LIMIT = 6;

const TONE_CLASS: Record<ReturnType<typeof possessionTone>, string> = {
  ready: "bg-emerald-50! text-emerald-800! ring-emerald-200!",
  building: "bg-amber-50! text-amber-900! ring-amber-200!",
  launch: "bg-sky-50! text-sky-900! ring-sky-200!",
};

/**
 * Cover gallery.
 *
 * Two deliberate departures from the old hero. The title, address and price
 * no longer sit on the photo: a scrim dark enough to carry an h1 over an
 * arbitrary cover shot ruins the shot, and the same three facts were already
 * repeated below it. And the thumbnail strip sits *inside* the card on white
 * rather than hanging off the bottom edge on a negative margin, where it
 * overlapped the title on narrow viewports and fought the arrows for z-index.
 */
export function ProjectGallery({ project }: { project: ProjectDetail }) {
  const images = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(
    Boolean,
  ) as string[];
  const mobileCover = project.mobileCoverImageUrl || null;
  const placeholder = getPlaceholderImage({ projectType: project.projectType });
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      const index = (next + count) % count;
      setActive(index);
      // Keep the chosen thumbnail in view when the strip is scrolled.
      stripRef.current
        ?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
    [count],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (count < 2) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    }
  };

  const tone = possessionTone(project.possessionStatus);
  const thumbs = images.slice(0, THUMB_LIMIT);

  return (
    <section
      aria-label={`${project.name} photos`}
      className="bg-white! rounded-card! border! border-gray-200/70! shadow-sm! overflow-hidden!"
    >
      <div
        role={count > 1 ? "group" : undefined}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        className="relative! h-[280px]! sm:h-[380px]! lg:h-[460px]! bg-gray-100! group/stage! outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-inset!"
      >
        {count > 0 ? (
          images.map((img, index) => (
            <div
              key={img}
              aria-hidden={index !== active}
              className={`absolute! inset-0! transition-opacity! duration-250! ease-out-quint! ${
                index === active ? "opacity-100! z-10!" : "opacity-0! z-0!"
              }`}
            >
              {/* Only the cover has a dedicated portrait crop, so only the
                  cover pays for two <img> nodes. */}
              {index === 0 && mobileCover ? (
                <>
                  <ListingImage
                    src={img}
                    placeholderSrc={placeholder}
                    alt={`${project.name} — cover`}
                    eager
                    className="w-full! h-full! object-cover! hidden! md:block!"
                  />
                  <ListingImage
                    src={mobileCover}
                    placeholderSrc={placeholder}
                    alt={`${project.name} — cover`}
                    eager
                    className="w-full! h-full! object-cover! md:hidden!"
                  />
                </>
              ) : (
                <ListingImage
                  src={img}
                  placeholderSrc={placeholder}
                  alt={`${project.name} — photo ${index + 1}`}
                  eager={index === 0}
                  className="w-full! h-full! object-cover!"
                />
              )}
            </div>
          ))
        ) : (
          <ListingImage
            src={null}
            placeholderSrc={placeholder}
            alt={project.name}
            eager
            className="w-full! h-full! object-cover!"
          />
        )}

        {/* Badges. A scrim would be the obvious way to keep these legible over
            any cover; opaque chips do it without touching the photograph. */}
        <div className="absolute! top-4! left-4! z-20! flex! flex-wrap! items-center! gap-2!">
          <span className="inline-flex! items-center! px-3! py-1! rounded-full! bg-white! text-xs! font-semibold! text-gray-900! ring-1! ring-gray-200!">
            {projectTypeLabel(project.projectType)}
          </span>
          <span
            className={`inline-flex! items-center! px-3! py-1! rounded-full! text-xs! font-semibold! ring-1! ${TONE_CLASS[tone]}`}
          >
            {titleCase(project.possessionStatus)}
          </span>
        </div>

        {count > 1 && (
          <>
            {/* Both arrows behave identically. The old hero revealed "previous"
                on hover and left "next" permanently visible, which read as a
                one-way gallery. */}
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous photo"
              className="absolute! left-3! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#27427f]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
            >
              <ChevronLeft className="w-5! h-5!" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next photo"
              className="absolute! right-3! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#27427f]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
            >
              <ChevronRight className="w-5! h-5!" />
            </button>
          </>
        )}

        {count > 0 && (
          <div className="absolute! bottom-4! right-4! z-20! flex! items-center! gap-2!">
            {count > 1 && (
              <span
                aria-live="polite"
                className="px-3! py-1! rounded-full! bg-gray-900/80! backdrop-blur-sm! text-xs! font-medium! text-white! tabular-nums!"
              >
                {active + 1} / {count}
              </span>
            )}
            <Link
              href={`/${project.canonicalSlug}/photos`}
              className="inline-flex! items-center! gap-2! px-3! py-1.5! rounded-full! bg-white! text-xs! font-semibold! text-gray-900! ring-1! ring-black/5! no-underline! transition-colors! duration-150! ease-out-quint! hover:bg-gray-50! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
            >
              <Images className="w-4! h-4!" />
              {count === 1 ? "View photo" : `All ${count} photos`}
            </Link>
          </div>
        )}
      </div>

      {count > 1 && (
        <div
          ref={stripRef}
          className="flex! gap-2! overflow-x-auto! hide-scrollbar! p-3! border-t! border-gray-200!"
        >
          {thumbs.map((img, index) => (
            <button
              key={img}
              type="button"
              data-thumb={index}
              onClick={() => go(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active}
              className={`relative! shrink-0! h-16! w-24! sm:h-20! sm:w-28! rounded-lg! overflow-hidden! bg-gray-100! cursor-pointer! transition-[opacity,box-shadow]! duration-150! ease-out-quint! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! ${
                index === active
                  ? "ring-2! ring-[#27427f]!"
                  : "opacity-70! ring-1! ring-gray-200! hover:opacity-100!"
              }`}
            >
              <ListingImage
                src={img}
                placeholderSrc={placeholder}
                alt=""
                className="w-full! h-full! object-cover!"
              />
            </button>
          ))}
          {count > THUMB_LIMIT && (
            <Link
              href={`/${project.canonicalSlug}/photos`}
              className="shrink-0! h-16! w-24! sm:h-20! sm:w-28! rounded-lg! bg-gray-50! ring-1! ring-gray-200! flex! flex-col! items-center! justify-center! gap-1! no-underline! transition-colors! duration-150! ease-out-quint! hover:bg-gray-100! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
            >
              <span className="text-sm! font-semibold! text-gray-900! tabular-nums!">
                +{count - THUMB_LIMIT}
              </span>
              <span className="text-xs! text-gray-500!">more</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
