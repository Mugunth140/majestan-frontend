"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import type { ProjectDetail } from "@/lib/api/projects";

/**
 * Cover gallery: the photograph and nothing on it.
 *
 * No badges, no scrim, no thumbnail strip, no "View photos" link. Possession
 * status is in the key facts rail directly below, the project type is in the
 * project details, and the Photos tab is always one click away in the sticky
 * section nav, so repeating any of it over the image only made it busier. The arrows and the counter
 * remain for the cases where there is more than one photograph to step through.
 */
export function ProjectGallery({ project }: { project: ProjectDetail }) {
  const images = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(
    Boolean,
  ) as string[];
  const mobileCover = project.mobileCoverImageUrl || null;
  const placeholder = getPlaceholderImage({ projectType: project.projectType });
  const [active, setActive] = useState(0);

  const count = images.length;
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      const index = (next + count) % count;
      setActive(index);
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

  return (
    <section
      aria-label={`${project.name} photos`}
      /* Edge to edge, so no card chrome: rounded corners and a border only
         make sense on something that sits inside the page column. */
      className="bg-gray-100! overflow-hidden!"
    >
      <div
        role={count > 1 ? "group" : undefined}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        /* A banner, not a poster: full width, but sized so the title and the
           key facts row still show on the first screen. 167px sits above it
           (navbar, section tabs, breadcrumb row) and 199px below it down to the
           facts row's bottom edge; 390px leaves 24px of air under that row.
           That lands at 57% of a 900px screen and 64% of 1080px, clamped to
           70% on very tall screens and a 280px floor on short ones. Phones keep
           4:5: there the cover is the hero and the facts sit just below it. */
        className="relative! aspect-[4/5]! sm:aspect-auto! sm:h-[calc(100svh-390px)]! sm:min-h-[280px]! sm:max-h-[70svh]! bg-gray-100! group/stage! outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-inset!"
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

        {count > 1 && (
          <>
            {/* Both arrows behave identically. The old hero revealed "previous"
                on hover and left "next" permanently visible, which read as a
                one-way gallery. */}
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous photo"
              className="absolute! left-4! md:left-6! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#27427f]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
            >
              <ChevronLeft className="w-5! h-5!" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next photo"
              className="absolute! right-4! md:right-6! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#27427f]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
            >
              <ChevronRight className="w-5! h-5!" />
            </button>
          </>
        )}

        {count > 1 && (
          <div className="absolute! bottom-4! right-4! md:bottom-6! md:right-6! z-20!">
            <span
              aria-live="polite"
              className="px-3! py-1! rounded-full! bg-gray-900/80! backdrop-blur-sm! text-xs! font-medium! text-white! tabular-nums!"
            >
              {active + 1} / {count}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
