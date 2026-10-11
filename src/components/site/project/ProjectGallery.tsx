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
/**
 * Fills the banner either side of the 16:9 photo with a soft, blurred copy of
 * the same image, so the frame reads as part of one banner rather than a
 * picture on grey. Decorative and hidden from assistive tech. A failed load
 * (a missing storage object, say) falls back to the type placeholder instead
 * of a broken-image icon blown up to the banner's width.
 */
function Backdrop({ src, fallback }: { src: string | null; fallback: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const url = src && src !== failedSrc ? src : fallback;
  return (
    <div aria-hidden="true" className="hidden! sm:block! absolute! inset-0!">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        decoding="async"
        onError={() => {
          if (src) setFailedSrc(src);
        }}
        className="w-full! h-full! object-cover! scale-110! blur-xl! opacity-70!"
      />
      <div className="absolute! inset-0! bg-gray-900/10!" />
    </div>
  );
}

export function ProjectGallery({ project }: { project: ProjectDetail }) {
  const images = [
    project.coverImageUrl,
    ...(project.galleryImageUrls ?? []),
  ].filter(Boolean) as string[];
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
      className="@container bg-gray-100! overflow-hidden!"
    >
      <div
        role={count > 1 ? "group" : undefined}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        /* A banner, not a poster: full width, sized so the title and the key
           facts row still show on the first screen. 167px sits above it
           (navbar, section tabs, breadcrumb row) and 199px below it to the
           facts row's bottom edge; 390px leaves 24px of air under that row.
           Clamped to 70% of very tall screens and 280px on short ones, and
           never taller than a full-width photo frame: 56.25cqw for 16:9 on
           tablets, 42.857cqw for 21:9 on laptops and up (cqw is the banner's
           own width; vw would include the scrollbar and overshoot by ~8px). Phones keep 4:5. */
        className="relative! overflow-hidden! aspect-[4/5]! sm:aspect-auto! sm:h-[min(56.25cqw,max(280px,min(calc(100svh-390px),70svh)))]! lg:h-[min(42.857cqw,max(280px,min(calc(100svh-390px),70svh)))]! bg-gray-100! group/stage! outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-inset!"
      >
        <Backdrop
          src={count > 0 ? images[active] : null}
          fallback={placeholder}
        />

        {/* The photo keeps a fixed cinematic ratio — 21:9 on laptops and up,
            16:9 on tablets — rather than whatever shape the banner happens to
            be, which on a wide screen was a ~2.8:1 strip that cut off the top
            floors of every tower. Phones fill the 4:5 frame. */}
        <div className="relative! w-full! h-full! sm:w-auto! sm:max-w-full! sm:aspect-video! lg:aspect-[21/9]! sm:mx-auto! sm:shadow-[0_12px_48px_rgba(16,24,40,0.28)]!">
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
                      className="w-full! h-full! object-cover! hidden! sm:block!"
                    />
                    <ListingImage
                      src={mobileCover}
                      placeholderSrc={placeholder}
                      alt={`${project.name} — cover`}
                      eager
                      className="w-full! h-full! object-cover! sm:hidden!"
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
