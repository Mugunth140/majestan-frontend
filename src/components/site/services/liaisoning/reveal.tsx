"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Scroll reveal for sections *below* the fold only.
 *
 * The hero is deliberately NOT wrapped in this: it holds the LCP element, and an
 * entrance animation there trades real perceived speed for decoration.
 *
 * A spring rather than a tween, so a reveal interrupted by a fast scroll picks up
 * the current value instead of snapping. Critically damped (`bounce: 0`) because
 * no gesture caused this — overshoot on a section that merely faded up reads as
 * a mistake.
 *
 * Under `prefers-reduced-motion` the content renders in place with no transform
 * and no opacity ramp, so nothing moves at all.
 *
 * Two exports rather than an `as` prop: a <div> inside an <ol> would silently
 * break list semantics, and mapping over motion's component table to avoid the
 * duplication just trades a bug for a type cast.
 */

const INITIAL = { opacity: 0, y: 24 };
const ANIMATE = { opacity: 1, y: 0 };

function useRevealTransition(delay: number) {
  const reduceMotion = usePrefersReducedMotion();
  if (reduceMotion) return null;
  return { type: "spring", bounce: 0, duration: 0.5, delay } as const;
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Stagger offset in seconds. Keep the total under ~0.3s or it reads as lag. */
  delay?: number;
  className?: string;
}) {
  const transition = useRevealTransition(delay);

  if (!transition) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={INITIAL}
      whileInView={ANIMATE}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const transition = useRevealTransition(delay);

  if (!transition) return <li className={className}>{children}</li>;

  return (
    <motion.li
      className={className}
      initial={INITIAL}
      whileInView={ANIMATE}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.li>
  );
}
