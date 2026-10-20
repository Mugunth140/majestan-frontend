"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  X,
} from "lucide-react";
import type { PropertyFloorPlan } from "@/lib/property-floor-plans";
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";
import styles from "./property-floor-plans.module.css";

type Props = {
  plans: PropertyFloorPlan[];
  propertyTitle?: string;
  preview?: boolean;
};

export function PropertyFloorPlanGallery({
  plans,
  propertyTitle = "this property",
  preview = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const selected = plans[index] ?? plans[0];
  const shown = preview ? plans.slice(0, 2) : plans;
  useLockBodyScroll(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const select = (next: number) => {
    setFailedKey(null);
    setIndex((next + plans.length) % plans.length);
  };
  const step = (delta: number) => select(index + delta);
  if (!plans.length) return null;

  return (
    <>
      <div
        className={`${styles.grid} ${shown.length === 1 ? styles.single : ""}`}
      >
        {shown.map((plan, planIndex) => (
          <figure key={plan.key} className="m-0!">
            <button
              type="button"
              className={styles.tile}
              aria-label={`View ${plan.title}${plan.isPdf ? " (PDF)" : ""}`}
              onClick={() => {
                select(planIndex);
                setOpen(true);
              }}
            >
              <span className={styles.thumbnail}>
                {plan.isPdf ? (
                  <span className={styles.pdfTile}>
                    <FileText size={36} aria-hidden="true" />
                    <span>PDF plan</span>
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={plan.src}
                    alt={plan.altText || plan.title}
                    title={plan.titleText}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                )}
              </span>
              <span className={styles.tileCaption}>
                {plan.title}
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
            {plan.caption && (
              <figcaption className="mt-2! text-sm! text-gray-600!">
                {plan.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        aria-label={`Floor plans for ${propertyTitle}`}
        className={styles.dialog}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (plans.length < 2) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
        }}
      >
        {open && selected && (
          <>
            <header className={styles.header}>
              <div className={styles.identity}>
                <h2 className={styles.title}>{selected.title}</h2>
                <p className={styles.counter} aria-live="polite">
                  {index + 1} of {plans.length}
                </p>
              </div>
              <a
                href={selected.src}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fileLink}
              >
                <ExternalLink size={16} aria-hidden="true" />
                <span>Open file</span>
              </a>
              <button
                type="button"
                className={styles.control}
                onClick={() => setOpen(false)}
                aria-label="Close floor plan viewer"
              >
                <X size={20} />
              </button>
            </header>
            <div
              className={styles.stage}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start || plans.length < 2) return;
                const touch = event.changedTouches[0];
                const delta = touch.clientX - start.x;
                if (
                  Math.abs(delta) > 60 &&
                  Math.abs(delta) > Math.abs(touch.clientY - start.y) * 1.5
                )
                  step(delta > 0 ? -1 : 1);
              }}
            >
              {selected.isPdf ? (
                <iframe
                  key={selected.key}
                  src={selected.src}
                  title={`${selected.title} floor plan PDF`}
                  className={styles.document}
                />
              ) : failedKey === selected.key ? (
                <p className={styles.error} role="alert">
                  This plan could not be loaded. Use “Open file” to view the
                  original.
                </p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={selected.key}
                  src={selected.src}
                  alt={selected.altText || `${selected.title} floor plan`}
                  draggable={false}
                  onError={() => setFailedKey(selected.key)}
                  className={styles.drawing}
                />
              )}
            </div>
            <footer className={styles.footer}>
              <button
                type="button"
                disabled={plans.length < 2}
                onClick={() => step(-1)}
                className={styles.control}
                aria-label="Previous floor plan"
              >
                <ChevronLeft size={20} />
              </button>
              <div
                className={styles.floors}
                role="group"
                aria-label="Choose a floor plan"
              >
                {plans.map((plan, planIndex) => (
                  <button
                    key={plan.key}
                    type="button"
                    className={styles.floor}
                    aria-pressed={planIndex === index}
                    onClick={() => select(planIndex)}
                  >
                    {plan.title}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={plans.length < 2}
                onClick={() => step(1)}
                className={styles.control}
                aria-label="Next floor plan"
              >
                <ChevronRight size={20} />
              </button>
            </footer>
          </>
        )}
      </dialog>
    </>
  );
}
