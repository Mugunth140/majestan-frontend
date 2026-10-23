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
  const images = [
    project.coverImageUrl,
    ...(project.galleryImageUrls ?? []),
  ].filter(Boolean) as string[];
  const mobileCover = project.mobileCoverImageUrl || null;
  const altOverrides = (
    project as ProjectDetail & {
      galleryImageAltOverrides?: Record<string, string>;
    }
  ).galleryImageAltOverrides;
  const media =
    (
      project as ProjectDetail & {
        galleryImageSeo?: Record<
          string,
          { titleText?: string; caption?: string }
        >;
      }
    ).galleryImageSeo || {};
  const altFor = (src: string, fallback: string) =>
    altOverrides?.[src] || fallback;
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
    <figure
      aria-label={`${project.name} photos`}
      /* In the page column, so it lines up with the title and the facts row
         below it and carries the same corners as every card on the page. */
      className="bg-gray-100! rounded-2xl! overflow-hidden!"
    >
      <div
        role={count > 1 ? "group" : undefined}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        /* 21:9 on laptops and up, 16:9 on tablets, 4:5 on phones, where a wide
           band on a 375px screen is a sliver and the portrait mobile cover
           crop would go unused. */
        className="relative! overflow-hidden! aspect-[4/5]! sm:aspect-video! lg:aspect-[21/9]! bg-gray-100! group/stage! outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-inset!"
      >
        <div className="absolute! inset-0!">
          <ListingImage
            key={active}
            src={images[active] || null}
            mobileSrc={active === 0 ? mobileCover : null}
            placeholderSrc={placeholder}
            alt={altFor(images[active], `${project.name} — photo ${active + 1}`)}
            title={media[images[active]]?.titleText}
            eager
            sizes="(max-width: 1250px) 100vw, 1200px"
            className="w-full! h-full! object-cover!"
          />
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
              className="absolute! left-4! md:left-6! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#1645bf]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
            >
              <ChevronLeft className="w-5! h-5!" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next photo"
              className="absolute! right-4! md:right-6! top-1/2! -translate-y-1/2! z-20! grid! place-items-center! h-10! w-10! rounded-full! bg-white/90! text-gray-900! backdrop-blur-sm! ring-1! ring-black/5! cursor-pointer! transition-[opacity,transform,background-color]! duration-150! ease-out-quint! hover:bg-white! active:scale-95! focus-visible:ring-2! focus-visible:ring-[#1645bf]! md:opacity-0! md:group-hover/stage:opacity-100! md:focus-visible:opacity-100!"
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
      {media[images[active]]?.caption && (
        <figcaption className="px-4! py-3! text-sm! text-gray-600!">
          {media[images[active]].caption}
        </figcaption>
      )}
    </figure>
  );
}
