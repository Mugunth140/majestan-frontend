"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

import { FAQ } from "./content";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Single-open accordion. A height spring rather than a fixed-duration tween, so
 * opening a second panel mid-collapse inherits the first one's velocity instead
 * of restarting from zero — the "brick wall" you feel when a transition replaces
 * itself mid-flight.
 *
 * Critically damped (`bounce: 0`): a disclosure is a discrete state change, not
 * a throw, so overshoot would read as the panel bouncing past its own content.
 */
const HEIGHT_SPRING = { type: "spring", bounce: 0, duration: 0.35 } as const;

export function LiaisoningFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = usePrefersReducedMotion();
  const baseId = useId();

  return (
    <section
      className="py-[56px]! md:py-[76px]!"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="max-w-2xl! mb-[34px]!">
          <span className="liaisoning-eyebrow inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]/[0.07]! px-[13px]! py-[6px]! text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-[#27427f]!">
            Questions
          </span>
          <h2
            id="faq-heading"
            className="mt-[14px]! text-[clamp(24px,3.2vw,34px)]! font-semibold! text-[#161e2d]! leading-[1.1]! tracking-[-0.02em]!"
          >
            {FAQ.title}
          </h2>
        </div>

        <ul className="space-y-[10px]! max-w-3xl!">
          {FAQ.items.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-faq-btn-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;

            return (
              <li
                key={item.question}
                className={`overflow-hidden! rounded-[18px]! border! bg-white! transition-colors! duration-200! ${
                  isOpen
                    ? "border-[#27427f]/35! shadow-[0_10px_30px_-20px_rgba(22,30,45,0.3)]!"
                    : "border-gray-200! hover:border-gray-300!"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex! w-full! items-center! justify-between! gap-4! px-[20px]! md:px-[24px]! py-[18px]! text-left! transition-colors! duration-150! hover:bg-[#f7f9fc]!"
                  >
                    <span className="text-[14px]! md:text-[15px]! font-semibold! text-[#161e2d]! leading-snug!">
                      {item.question}
                    </span>
                    {/* Press feedback on the affordance itself, and the glyph
                        rotates with the panel rather than swapping icons. */}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className="flex! shrink-0! items-center! justify-center! w-[28px]! h-[28px]! rounded-full! bg-[#27427f]/[0.07]! text-[#27427f]!"
                    >
                      <Plus className="w-[15px]! h-[15px]!" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className="overflow-hidden!"
                    >
                      <p className="px-[20px]! md:px-[24px]! pb-[20px]! text-[13px]! md:text-[14px]! font-normal! text-gray-600! leading-[1.7]! max-w-2xl!">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
