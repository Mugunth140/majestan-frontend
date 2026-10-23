"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import {
  Panel,
  FOCUS_RING,
} from "@/components/site/project/overview/overview-ui";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";

type PhotosSectionProps = { property: SeoProperty; embedded?: boolean };
const LIGHTBOX_BUTTON =
  "grid! h-10! w-10! shrink-0! place-items-center! rounded-full! border! border-white/20! bg-white/10! text-white! cursor-pointer! transition-colors! duration-150! hover:bg-white/20! focus-visible:outline-2! focus-visible:outline-white! focus-visible:outline-offset-4!";

export function PhotosSection({
  property,
  embedded = false,
}: PhotosSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const images = [...(property.images ?? [])].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
  const count = images.length;
  const selected = images[currentIndex] ?? images[0];
  useLockBodyScroll(lightboxOpen);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    else if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  const step = (delta: number) =>
    setCurrentIndex((index) => (index + delta + count) % count);

  return (
    <div className="flex! flex-col! gap-6! min-w-0!">
      <Panel
        id="property-photos"
        title="Photos"
        meta={
          count
            ? `${count} ${count === 1 ? "photo" : "photos"} of ${property.title}`
            : undefined
        }
      >
        {count ? (
          <div className="mt-6! grid! grid-cols-2! gap-3!">
            {images.map((photo, index) => (
              <figure
                key={photo.id}
                className={`m-0! min-w-0! ${index === 0 ? "col-span-2!" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(index);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Open photo ${index + 1} of ${property.title}`}
                  className={`group/photo relative! overflow-hidden! rounded-xl! bg-[#eef1f6]! cursor-pointer! ${index === 0 ? "col-span-2! aspect-[16/9]!" : "aspect-[4/3]!"} ${FOCUS_RING}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={
                      photo.altText || `${property.title} photo ${index + 1}`
                    }
                    title={photo.titleText}
                    loading="lazy"
                    decoding="async"
                    className="block! h-full! w-full! object-cover! transition-transform! duration-300! ease-out-quint! group-hover/photo:scale-[1.02]! motion-reduce:transition-none!"
                  />
                </button>
                {photo.caption && (
                  <figcaption className="mt-2! text-sm! text-gray-600!">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-6! text-base! text-[#465066]! leading-relaxed!">
            Photos have not been published for this property yet. Contact us to
            arrange a viewing.
          </p>
        )}
      </Panel>
      <dialog
        ref={dialogRef}
        aria-label={`Photos of ${property.title}`}
        onClose={() => setLightboxOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" && count > 1) {
            event.preventDefault();
            step(1);
          }
          if (event.key === "ArrowLeft" && count > 1) {
            event.preventDefault();
            step(-1);
          }
        }}
        className="fixed! inset-0! m-0! w-screen! max-w-none! h-dvh! max-h-none! border-0! bg-[#0a0f1c]! text-white! p-4! sm:p-8! backdrop:bg-black/70!"
      >
        {lightboxOpen && selected && (
          <div className="flex! h-full! flex-col! gap-4!">
            <div className="flex! items-center! justify-between! gap-4!">
              <p className="m-0! text-sm! text-white/75! tabular-nums!">
                {currentIndex + 1} / {count}
              </p>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className={LIGHTBOX_BUTTON}
                aria-label="Close lightbox"
              >
                <X className="w-5! h-5!" />
              </button>
            </div>
            <div className="relative! flex! flex-1! min-h-0! items-center! justify-center!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.imageUrl}
                title={selected.titleText}
                alt={
                  selected.altText ||
                  `${property.title} photo ${currentIndex + 1}`
                }
                className="max-h-full! max-w-full! object-contain!"
              />
              {selected.caption && <p className="text-white!">{selected.caption}</p>}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={`${LIGHTBOX_BUTTON} absolute! left-0!`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5! h-5!" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className={`${LIGHTBOX_BUTTON} absolute! right-0!`}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5! h-5!" />
                  </button>
                </>
              )}
            </div>
            {count > 1 && (
              <div className="flex! shrink-0! gap-2! mx-auto! max-w-full! overflow-x-auto! p-1!">
                {images.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`View photo ${index + 1}`}
                    aria-pressed={index === currentIndex}
                    className={`h-12! w-16! shrink-0! overflow-hidden! rounded-sm! cursor-pointer! focus-visible:outline-2! focus-visible:outline-white! ${index === currentIndex ? "outline-1! outline-white! outline-offset-2!" : "opacity-50! hover:opacity-100!"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt=""
                      className="h-full! w-full! object-cover!"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
      {!embedded && <NeedMoreDetails propertyType={property.propertyType} />}
    </div>
  );
}
