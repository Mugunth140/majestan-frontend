"use client";

import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CATEGORIES } from "./content";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/* ── Apple physics ──────────────────────────────────────────────────────────
 * Both helpers are lifted from Apple's "Designing Fluid Interfaces" sample
 * code, deliberately. In particular `project` uses the exponential-decay form,
 * not the physics-textbook v²/(2·decel): the exponential form is what a real
 * scroll view decelerates with, and it is what makes a flick land where the
 * gesture was heading instead of near where the finger let go.
 */
const DECELERATION_RATE = 0.998;

function project(velocity: number, decelerationRate = DECELERATION_RATE): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Spring presets. `bounce`+`duration` are Motion's stand-ins for Apple's
 * damping + response.
 *
 * SNAP is under-damped on purpose: a flick carried real momentum, so a little
 * overshoot reads as the throw continuing. SETTLE is critically damped because
 * nothing physical caused it — a panel that merely cross-faded should not bounce.
 */
const SNAP_SPRING = { type: "spring", bounce: 0.2, duration: 0.4 } as const;
const SETTLE_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Progressive resistance past each bound — a soft stop, not a hard one. */
function applyRubberband(value: number, max: number, dimension: number): number {
  if (value < 0) return -rubberband(-value, dimension);
  if (value > max) return max + rubberband(value - max, dimension);
  return value;
}

/** Velocity in px/s from a short sample history, the way a scroll view derives it. */
function velocityFrom(samples: readonly { t: number; x: number }[]): number {
  if (samples.length < 2) return 0;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const elapsed = last.t - first.t;
  if (elapsed <= 0) return 0;
  return ((last.x - first.x) / elapsed) * 1000;
}

type DragState = {
  active: boolean;
  pointerId: number;
  startX: number;
  startOffset: number;
};

export function CategoryRail() {
  const reduceMotion = usePrefersReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragRef = useRef<DragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startOffset: 0,
  });
  const samplesRef = useRef<{ t: number; x: number }[]>([]);

  const active = CATEGORIES[activeIndex];

  /** Scroll offset in px, always >= 0. Only `x` on the track derives from it. */
  const offset = useMotionValue(0);
  const trackX = useTransform(offset, (value) => -value);
  const progressScale = useTransform(offset, [0, Math.max(1, maxScroll)], [0.12, 1]);

  /**
   * Measure the snap step from the live layout rather than hard-coding it: card
   * widths are percentage-based and change across four breakpoints, so any
   * baked-in px step would drift out of alignment on resize or rotation.
   *
   * Runs against whichever rail variant is mounted. Without this the
   * reduced-motion path — which renders the native scroll-snap rail — would never
   * populate `maxScroll`, and the arrows plus the progress fill would silently
   * disappear for exactly the users least able to discover a swipe gesture.
   */
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const first = track.firstElementChild as HTMLElement | null;
    if (!first) {
      setStep(0);
      setMaxScroll(0);
      return;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;

    setStep(first.offsetWidth + gap);
    setMaxScroll(Math.max(0, track.scrollWidth - viewport.clientWidth));
  }, []);

  useEffect(() => {
    // Re-measure when the variant swaps, otherwise a page loaded with
    // reduced-motion already set keeps the previous branch's numbers.
    measure();

    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measure, reduceMotion]);

  /** Snap index is chosen from the projected resting point, not the release point. */
  const settle = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    setDragging(false);

    const releaseVelocity = velocityFrom(samplesRef.current);
    const projected = offset.get() + project(releaseVelocity);
    const snapped = step > 0 ? Math.round(projected / step) * step : 0;
    const target = clamp(snapped, 0, maxScroll);

    // Hand the release velocity to the spring so the drag→animation seam is
    // invisible. Dropping it here is exactly the "brick wall" you feel when a
    // gesture is reversed mid-flight.
    animate(offset, target, { ...SNAP_SPRING, velocity: releaseVelocity });
  }, [maxScroll, offset, step]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || maxScroll <= 0) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    // startOffset is the *presentation* value, not a stored resting value. If a
    // snap spring is still in flight when the user grabs the rail, the drag
    // continues from where the rail actually is on screen — no jump, no wait for
    // the animation to finish. This is the whole point.
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offset.get(),
    };
    samplesRef.current = [{ t: event.timeStamp, x: offset.get() }];
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const dimension = viewportRef.current?.clientWidth ?? 0;
    const raw = drag.startOffset - (event.clientX - drag.startX);

    offset.set(applyRubberband(raw, maxScroll, dimension));

    samplesRef.current.push({ t: event.timeStamp, x: offset.get() });
    if (samplesRef.current.length > 5) samplesRef.current.shift();
  };

  const endDrag = () => {
    if (!dragRef.current.active) return;
    settle();
  };

  const nudge = (direction: -1 | 1) => {
    if (step <= 0) return;

    // Reduced motion drives the browser's own scroller instead of a spring, so
    // the arrows stay in sync with a swiped position without animating anything
    // the user did not move themselves.
    if (reduceMotion) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const current = Math.round(viewport.scrollLeft / step) * step;
      viewport.scrollTo({
        left: clamp(current + direction * step, 0, maxScroll),
        behavior: "auto",
      });
      return;
    }

    const base = Math.round(offset.get() / step) * step;
    animate(offset, clamp(base + direction * step, 0, maxScroll), SNAP_SPRING);
  };

  const selectCategory = (index: number) => {
    if (index === activeIndex) return;

    // Abort any in-flight drag before the card set is swapped out from under it.
    if (dragRef.current.active) dragRef.current.active = false;
    setDragging(false);

    setActiveIndex(index);
    animate(offset, 0, SNAP_SPRING);
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % CATEGORIES.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = CATEGORIES.length - 1;

    if (next === null) return;
    event.preventDefault();
    selectCategory(next);
    tabRefs.current[next]?.focus();
  };

/**
 * How close to the end of travel counts as "at the end", as a fraction of a
 * card step.
 *
 * The final snap position is `maxScroll`, which is generally not a whole
 * multiple of the step, so a strict `offset >= maxScroll` test leaves "next"
 * enabled with only a few pixels left to give. A 13px move reads as a button
 * that swallowed the click. Requiring the remainder to be under 15% of a card
 * instead disables it — the cost is that the last card ends up clipped by a few
 * pixels, which on a 273px card is not perceptible, and the user can still drag
 * to the exact end.
 */
const END_SLACK = 0.15;


  /**
   * Edge state, tracked as its own state rather than derived from the card
   * index — see END_SLACK for why a strict index comparison is wrong here.
   */
  const setEdges = (start: boolean, end: boolean) => {
    setAtStart((prev) => (prev === start ? prev : start));
    setAtEnd((prev) => (prev === end ? prev : end));
  };

  /**
   * Keep the "card n of m" readout and the arrow disabled-states in sync with
   * the rail. Returning the previous value when nothing changed lets React bail
   * out, so a full drag costs ~7 re-renders rather than ~300 — without that
   * guard every frame would re-render all seven <Image> nodes.
   *
   * No setState in the step<=0 branch: step can only be 0 when there are no
   * cards, which also means maxScroll is 0, which means the arrows this state
   * drives are not rendered at all.
   */
  useEffect(() => {
    if (step <= 0) return;
    return offset.on("change", (value) => {
      const next = clamp(Math.round(value / step), 0, active.items.length - 1);
      setVisibleIndex((prev) => (prev === next ? prev : next));
      setEdges(value <= 1, value >= maxScroll - step * END_SLACK);
    });
  }, [active.items.length, maxScroll, offset, step]);

  // Reset the readout when the category changes. Adjusted during render rather
  // than in an effect on purpose: this is state derived from a prop, and doing it
  // in an effect would paint the previous category's "5 / 6" for a frame before
  // correcting it — a visible flicker on every tab switch.
  const [renderedIndex, setRenderedIndex] = useState(activeIndex);
  if (renderedIndex !== activeIndex) {
    setRenderedIndex(activeIndex);
    setVisibleIndex(0);
    setEdges(true, false);
  }

  const canScroll = maxScroll > 0;
  const tabListId = "liaisoning-category-tabs";
  const panelId = "liaisoning-category-panel";

  const cardClass =
    "shrink-0! w-[78%]! sm:w-[48%]! md:w-[31%]! lg:w-[24%]! " +
    "liaisoning-card group! relative! overflow-hidden! rounded-[20px]! border! border-gray-200/80! " +
    "bg-white! p-[10px]! shadow-[0_1px_2px_rgba(22,30,45,0.04)]!";

  return (
    <section className="py-[56px]! md:py-[76px]!" aria-labelledby="liaisoning-categories-heading">
      <div className="relative! max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="flex! flex-col! md:flex-row! md:items-end! justify-between! gap-5! mb-[26px]!">
          <div className="max-w-2xl!">
            <h2
              id="liaisoning-categories-heading"
              className="text-[clamp(24px,3.2vw,34px)]! font-semibold! text-[#161e2d]! leading-[1.1]! tracking-[-0.02em]!"
            >
              Asset classes we handle
            </h2>
            <p className="mt-[10px]! text-[14px]! md:text-[15px]! font-normal! text-gray-500! leading-[1.6]!">
              The same approval discipline, applied to very different buildings. Pick a category
              to see what we cover.
            </p>
          </div>

          {/* Rail controls. Present only when the rail actually overflows —
              a dead arrow on a non-scrollable set reads as a broken page. */}
          {canScroll && (
            <div className="flex! items-center! gap-3!">
              <span className="text-[12px]! font-medium! text-gray-400! tabular-nums! whitespace-nowrap!">
                {visibleIndex + 1} / {active.items.length}
              </span>
              <div className="flex! items-center! gap-2!">
                <button
                  type="button"
                  onClick={() => nudge(-1)}
                  disabled={atStart}
                  aria-label={`Previous ${active.label.toLowerCase()}`}
                  className="flex! items-center! justify-center! w-[38px]! h-[38px]! rounded-full! border! border-gray-200! bg-white! text-gray-600! transition-all! duration-200! hover:border-[#27427f]! hover:text-[#27427f]! active:scale-[0.94]! disabled:opacity-35! disabled:pointer-events-none!"
                >
                  <ChevronLeft className="w-[18px]! h-[18px]!" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(1)}
                  disabled={atEnd}
                  aria-label={`Next ${active.label.toLowerCase()}`}
                  className="flex! items-center! justify-center! w-[38px]! h-[38px]! rounded-full! border! border-gray-200! bg-white! text-gray-600! transition-all! duration-200! hover:border-[#27427f]! hover:text-[#27427f]! active:scale-[0.94]! disabled:opacity-35! disabled:pointer-events-none!"
                >
                  <ChevronRight className="w-[18px]! h-[18px]!" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Segmented control.
            One translucent material layer only — a light surface stacked on
            another light surface collapses legibility, so the active thumb is a
            solid white pill sitting *on* the tinted track, not on top of a second
            translucent pane. */}
        <div
          role="tablist"
          aria-label="Liaisoning coverage by asset class"
          className="liaisoning-segmented inline-flex! p-[4px]! rounded-full! bg-[#27427f]/[0.06]! border! border-[#27427f]/10! max-w-full! overflow-x-auto! sm:overflow-visible!"
        >
          {CATEGORIES.map((category, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={category.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${tabListId}-tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectCategory(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`relative! shrink-0! whitespace-nowrap! rounded-full! px-[16px]! py-[9px]! text-[13px]! font-semibold! transition-colors! duration-200! ${
                  isActive ? "text-[#27427f]!" : "text-gray-500! hover:text-gray-800!"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="liaisoning-tab-thumb"
                    aria-hidden="true"
                    className="absolute! inset-0! rounded-full! bg-white! shadow-[0_2px_8px_rgba(22,30,45,0.10)]!"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", bounce: 0, duration: 0.32 }
                    }
                  />
                )}
                <span className="relative! z-10">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/*
          The tabpanel semantics live on this stable outer element, NOT on the
          thing that cross-fades. During a cross-dissolve two nodes coexist, and
          putting role="tabpanel" + a fixed id on both of them would ship a
          duplicate id and expose a stale panel to assistive tech mid-transition.
          Only one tabpanel with one id ever exists; the layer underneath is an
          unlabelled presentational cross-fade.

          `popLayout` rather than `wait` on that layer: it takes the outgoing copy
          out of flow so the incoming one mounts on the same frame, giving a real
          cross-dissolve. `wait` would hold the swap for the length of the exit
          and leave ~150ms of empty track on every switch.
        */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${tabListId}-tab-${active.id}`}
          tabIndex={0}
          className="mt-[26px]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]/40! rounded-[20px]!"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: -6, transition: { duration: 0.15 } }
              }
              transition={reduceMotion ? { duration: 0 } : SETTLE_SPRING}
            >
              {/*
                Reduced motion drops the JS rail entirely in favour of native
                scroll-snap: still fully scrollable and still snaps, but with no
                springs, no rubber-banding and nothing moving that the user did
                not move themselves.
              */}
              {reduceMotion ? (
                <div
                  ref={viewportRef}
                  className="flex! gap-[18px]! overflow-x-auto! snap-x! snap-mandatory! pb-[10px]! -mx-4! px-4! sm:mx-0! sm:px-0!"
                  // Drive the "n of m" readout and the arrow states from native
                  // scroll position, since no MotionValue is moving here.
                  onScroll={(event) => {
                    const el = event.currentTarget;
                    const left = el.scrollLeft;
                    if (step > 0) {
                      const next = clamp(
                        Math.round(left / step),
                        0,
                        active.items.length - 1,
                      );
                      setVisibleIndex((prev) => (prev === next ? prev : next));
                    }
                    setEdges(
                      left <= 1,
                      left >=
                        el.scrollWidth - el.clientWidth - step * END_SLACK,
                    );
                  }}
                >
                  <div ref={trackRef} className="flex! gap-[18px]!">
                    {active.items.map((item) => (
                      <div key={item.label} className={`${cardClass} snap-start`}>
                        <CategoryCard label={item.label} image={item.image} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  ref={viewportRef}
                  className="overflow-hidden! touch-pan-y!"
                  style={{ cursor: canScroll ? (dragging ? "grabbing" : "grab") : "default" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onLostPointerCapture={endDrag}
                  onDragStart={(event) => event.preventDefault()}
                >
                  <motion.div
                    ref={trackRef}
                    style={{ x: trackX }}
                    className={`flex! gap-[18px]! select-none! ${
                      dragging ? "will-change-transform!" : ""
                    }`}
                  >
                    {active.items.map((item) => (
                      <div key={item.label} className={cardClass}>
                        <CategoryCard
                          label={item.label}
                          image={item.image}
                          lifted={dragging}
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress fill. Hints in the direction of the gesture, which is the
              only reliable "there is more over there" cue on a track with no
              visible edge. Outside the cross-fade: it does not change per
              category, so fading it would be pure noise. */}
          {canScroll && (
            <div className="mt-[18px]! h-[3px]! w-full! rounded-full! bg-[#27427f]/10! overflow-hidden!">
              <motion.div
                style={{ scaleX: progressScale }}
                className="h-full! w-full! origin-left! rounded-full! bg-[#27427f]/45!"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  label,
  image,
  lifted = false,
}: {
  label: string;
  image: string;
  lifted?: boolean;
}) {
  return (
    <motion.figure
      className="m-0!"
      animate={{ scale: lifted ? 0.975 : 1 }}
      transition={{ type: "spring", bounce: 0, duration: 0.28 }}
    >
      {/* The renders ship as 600x380 PNGs with transparent backgrounds, so they
          composite onto the tint below with no white-box halo. `contain` keeps
          each one whole — these are diagrams, not photos, and cropping them
          would cut the buildings in half. */}
      <div className="relative! rounded-[14px]! bg-[#f5f7fc]! aspect-[4/3]! overflow-hidden! flex! items-center! justify-center!">
        <Image
          src={image}
          alt={label}
          width={600}
          height={380}
          loading="lazy"
          sizes="(max-width: 640px) 78vw, (max-width: 768px) 48vw, (max-width: 1024px) 31vw, 24vw"
          className="w-full! h-full! object-contain! p-[10px]! transition-transform! duration-500! group-hover:scale-[1.045]!"
        />
      </div>
      <figcaption className="mt-[11px]! px-[2px]! text-[13px]! font-semibold! text-gray-800! leading-snug!">
        {label}
      </figcaption>
    </motion.figure>
  );
}
