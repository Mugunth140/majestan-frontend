"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";

/**
 * A floor plan thumbnail that opens the plan full screen.
 *
 * A native <dialog> opened with showModal(): the browser traps focus, closes
 * it on Escape, makes the page behind it inert, and puts it in the top layer
 * above the sticky navbar, none of which has to be rebuilt here. Clicking
 * the dimmed area around the plan closes it too.
 */
export function FloorPlanLightbox({
  src,
  alt,
  title,
  subtitle,
}: {
  src: string;
  alt: string;
  title: string;
  subtitle?: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // The page behind a modal dialog is inert but still scrolls on a phone.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const close = () => dialogRef.current?.close();

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
          src={src}
          alt={alt}
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
        aria-label={title}
        onClose={() => setOpen(false)}
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
                {title}
              </p>
              {subtitle && (
                <p className="text-sm! text-gray-500! truncate!">{subtitle}</p>
              )}
            </div>
            <div className="flex! items-center! gap-1! shrink-0!">
              <a
                href={src}
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
          <div className="min-h-0! flex-1! overflow-auto! bg-gray-50! p-4! sm:p-6!">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              // Lazy images inside a closed dialog are not fetched, so the
              // full-size copy costs nothing until the plan is opened.
              loading="lazy"
              className="mx-auto! block! max-w-full! max-h-[calc(100svh-10rem)]! object-contain!"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
