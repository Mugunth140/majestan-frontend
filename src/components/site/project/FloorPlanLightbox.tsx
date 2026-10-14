"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";

/** One plan in the viewer: every unit of the project that has an image. */
export type FloorPlanSlide = {
  src: string;
  alt: string;
  title: string;
  subtitle?: string | null;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const SWIPE_PX = 48;

type Pan = { scale: number; x: number; y: number };
const FIT: Pan = { scale: 1, x: 0, y: 0 };

/**
 * A floor plan thumbnail that opens every plan in a zoomable viewer.
 *
 * Still a native <dialog> opened with showModal(): focus trap, Escape and
 * the top layer come free. Inside, slides step through each unit's plan
 * (arrows, counter, thumbnails, keyboard) and the plan magnifies so buyers
 * can read the small print: buttons, mouse wheel, drag-pan and double-tap.
 * Pinch-zoom is deliberately out — single-finger drag pans when zoomed and
 * swipes between slides at 1x.
 */
export function FloorPlanLightbox({
  items,
  index,
}: {
  items: FloorPlanSlide[];
  index: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(index);
  const [zoom, setZoom] = useState<Pan>(FIT);
  const count = items.length;
  const safeIndex = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const slide = items[Math.min(current, Math.max(count - 1, 0))];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setCurrent((next + count) % count);
      setZoom(FIT);
    },
    [count],
  );

  const zoomBy = useCallback((factor: number) => {
    setZoom((z) => {
      const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z.scale * factor));
      return scale === MIN_ZOOM ? FIT : { ...z, scale };
    });
  }, []);

  const toggleZoom = useCallback(() => {
    setZoom((z) => (z.scale === MIN_ZOOM ? { ...FIT, scale: DOUBLE_TAP_ZOOM } : FIT));
  }, []);

  const clampPan = (x: number, y: number, scale: number): Pan => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { scale, x, y };
    const maxX = Math.max(0, ((scale - 1) * rect.width) / 2);
    const maxY = Math.max(0, ((scale - 1) * rect.height) / 2);
    return {
      scale,
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  // The page behind a modal dialog is inert but still scrolls on a phone.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open ]);

  // Wheel zooms the plan; it must not scroll the page behind it, so the
  // listener is native and non-passive (React's onWheel cannot preventDefault).
  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? 1.2 : 1 / 1.2);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, zoomBy]);

  // Arrows step slides even while zoomed (panning is pointer-only); plus and
  // minus zoom, zero refits. Escape is the dialog's own doing.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(current + 1);
      else if (event.key === "ArrowLeft") go(current - 1);
      else if (event.key === "+" || event.key === "=") zoomBy(1.25);
      else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.25);
      else if (event.key === "0") setZoom(FIT);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, current, go, zoomBy]);

  const show = () => {
    setCurrent(safeIndex);
    setZoom(FIT);
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const close = () => dialogRef.current?.close();

  if (!slide) return null;

  const zoomed = zoom.scale > MIN_ZOOM;
  const zoomLabel = `${Math.round(zoom.scale * 100)}%`;

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="group/plan relative! block! w-full! rounded-xl! bg-gray-50! ring-1! ring-gray-200/70! overflow-hidden! aspect-[16/10]! cursor-zoom-in! transition-shadow! duration-150! ease-out-quint! hover:ring-[#27427f]/40! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={items[safeIndex].src}
          alt={items[safeIndex].alt}
          loading="lazy"
          decoding="async"
          className="w-full! h-full! object-contain! p-4! sm:p-6!"
        />
        <span className="absolute! bottom-3! right-3! inline-flex! items-center! gap-1.5! rounded-full! bg-white/95! px-3! py-1.5! text-xs! font-medium! text-[#27427f]! ring-1! ring-gray-200! shadow-sm! group-hover/plan:text-[#1e3563]!">
          <Maximize2 className="w-3.5! h-3.5!" aria-hidden="true" />
          View floor plan
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={slide.title}
        onClose={() => {
          setOpen(false);
          setZoom(FIT);
        }}
        // A click whose target is the dialog itself landed on the padding
        // around the panel, i.e. the dimmed area.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0! p-4! sm:p-8! w-full! h-full! max-w-none! max-h-none! border-0! bg-transparent! backdrop:bg-gray-950/80! open:flex! items-center! justify-center!"
      >
        <div className="flex! flex-col! w-full! max-w-5xl! max-h-full! rounded-[20px]! bg-white! shadow-2xl! overflow-hidden!">
          <div className="flex! items-center! justify-between! gap-4! px-5! py-3! border-b! border-gray-200!">
            <div className="min-w-0!">
              <p className="text-base! font-semibold! text-gray-900! truncate!">
                {slide.title}
              </p>
              {slide.subtitle && (
                <p className="text-sm! text-gray-500! truncate!">{slide.subtitle}</p>
              )}
            </div>
            <div className="flex! items-center! gap-1! shrink-0!">
              <a
                href={slide.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex! items-center! gap-1.5! rounded-lg! px-3! py-2! text-sm! font-medium! text-[#27427f]! no-underline! hover:bg-gray-100! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <ExternalLink className="w-4! h-4!" aria-hidden="true" />
                <span className="hidden! sm:inline!">Original</span>
                <span className="sr-only">
                  (opens the original image in a new tab)
                </span>
              </a>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close floor plan"
                className="grid! place-items-center! w-10! h-10! rounded-lg! text-gray-600! hover:bg-gray-100! hover:text-gray-900! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <X className="w-5! h-5!" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            role="group"
            aria-roledescription="carousel"
            aria-label={`Floor plans, ${current + 1} of ${count}`}
            className="relative! min-h-0! flex-1! overflow-hidden! bg-gray-50! touch-none! select-none!"
            onPointerDown={(event) => {
              if (!event.isPrimary || !zoomed) return;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              dragRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                x: zoom.x,
                y: zoom.y,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag || !event.isPrimary) return;
              setZoom((z) =>
                clampPan(
                  drag.x + event.clientX - drag.startX,
                  drag.y + event.clientY - drag.startY,
                  z.scale,
                ),
              );
            }}
            onPointerUp={(event) => {
              if (event.isPrimary) dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
            onTouchStart={(event) => {
              if (zoomed || event.touches.length !== 1) return;
              touchRef.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
              };
            }}
            onTouchEnd={(event) => {
              const start = touchRef.current;
              touchRef.current = null;
              if (!start || event.changedTouches.length === 0) return;
              const dx = event.changedTouches[0].clientX - start.x;
              const dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
                go(current + (dx < 0 ? 1 : -1));
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              onDoubleClick={toggleZoom}
              style={{
                transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
              }}
              className={`mx-auto! block! max-w-full! max-h-[calc(100svh-16rem)]! object-contain! motion-safe:transition-transform! motion-safe:duration-150! motion-safe:ease-out-quint! ${
                zoomed ? "cursor-grab! active:cursor-grabbing!" : "cursor-zoom-in!"
              }`}
            />

            {count > 1 && (
              <p className="absolute! top-3! left-3! rounded-full! bg-white/95! px-3! py-1! text-xs! font-medium! text-gray-700! tabular-nums! ring-1! ring-gray-200! shadow-sm!">
                {current + 1} / {count}
              </p>
            )}

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  aria-label="Previous floor plan"
                  className="absolute! left-3! top-1/2! -translate-y-1/2! grid! place-items-center! w-11! h-11! rounded-full! bg-white/95! text-gray-700! ring-1! ring-gray-200! shadow-sm! hover:text-gray-900! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
                >
                  <ChevronLeft className="w-5! h-5!" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  aria-label="Next floor plan"
                  className="absolute! right-3! top-1/2! -translate-y-1/2! grid! place-items-center! w-11! h-11! rounded-full! bg-white/95! text-gray-700! ring-1! ring-gray-200! shadow-sm! hover:text-gray-900! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
                >
                  <ChevronRight className="w-5! h-5!" aria-hidden="true" />
                </button>
              </>
            )}

            <div
              role="group"
              aria-label="Magnification"
              className="absolute! bottom-3! right-3! inline-flex! items-center! gap-0.5! rounded-full! bg-white/95! p-1! ring-1! ring-gray-200! shadow-sm!"
            >
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.5)}
                disabled={!zoomed}
                aria-label="Zoom out"
                className="grid! place-items-center! w-8! h-8! rounded-full! text-gray-700! hover:bg-gray-100! disabled:opacity-40! disabled:hover:bg-transparent! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <Minus className="w-4! h-4!" aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                className="min-w-12! text-center! text-xs! font-medium! text-gray-700! tabular-nums!"
              >
                {zoomLabel}
              </span>
              <button
                type="button"
                onClick={() => zoomBy(1.5)}
                disabled={zoom.scale >= MAX_ZOOM}
                aria-label="Zoom in"
                className="grid! place-items-center! w-8! h-8! rounded-full! text-gray-700! hover:bg-gray-100! disabled:opacity-40! disabled:hover:bg-transparent! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <Plus className="w-4! h-4!" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(FIT)}
                disabled={!zoomed}
                aria-label="Reset zoom to fit"
                className="grid! place-items-center! w-8! h-8! rounded-full! text-gray-700! hover:bg-gray-100! disabled:opacity-40! disabled:hover:bg-transparent! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <Maximize className="w-4! h-4!" aria-hidden="true" />
              </button>
            </div>
          </div>

          {count > 1 && (
            <div className="shrink-0! border-t! border-gray-200! px-4! py-3!">
              <div
                role="group"
                aria-label="Choose a floor plan"
                className="flex! gap-2! overflow-x-auto! scrollbar-hide!"
              >
                {items.map((item, thumbIndex) => (
                  <button
                    key={`${item.src}-${thumbIndex}`}
                    type="button"
                    onClick={() => go(thumbIndex)}
                    aria-label={`Show ${item.title}`}
                    aria-current={thumbIndex === current || undefined}
                    className={`h-14! w-20! shrink-0! overflow-hidden! rounded-lg! bg-gray-50! ring-2! transition-all! focus-visible:outline-none! focus-visible:ring-[#27427f]! ${
                      thumbIndex === current
                        ? "ring-[#27427f]!"
                        : "ring-gray-200! opacity-60! hover:opacity-100!"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="w-full! h-full! object-cover!"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
