"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/components/site/shared/use-prefers-reduced-motion";
import { Reveal } from "@/components/site/shared/reveal";

/**
 * Factual only. Deliberately avoids any response-time or "we'll call you back
 * within N hours" promise — the repo's own feature_todo.md flags an assured
 * callback SLA as still unimplemented, so committing to a turnaround on a
 * customer-facing page would be a claim the business has not made.
 */
const ITEMS = [
  {
    q: "What happens after I send the message?",
    a: "It reaches our team in Coimbatore and someone who works on that type of property picks it up. If your question is time-sensitive, calling is faster than the form.",
  },
  {
    q: "Can I visit the office to see listings?",
    a: "Yes. The head office is open Monday to Saturday, 9:00 AM to 6:00 PM. On Sundays we are closed except for scheduled viewings — call ahead and we will arrange one.",
  },
  {
    q: "I want to list a property rather than buy one.",
    a: "Use the Post Property option above, or send a message and choose “Post a property” as the topic. It is routed to the team that handles listings.",
  },
  {
    q: "Do you work with clients outside Coimbatore?",
    a: "We do, and the NRI service exists for buyers and sellers based abroad. Mention where you are in the message and you will be put in touch with the right person.",
  },
] as const;

const HEIGHT_SPRING = { type: "spring", bounce: 0, duration: 0.35 } as const;

export function ContactFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="py-[52px]! md:py-[72px]!" aria-labelledby="contact-faq-heading">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <h2
            id="contact-faq-heading"
            className="text-[clamp(21px,2.4vw,26px)]! font-medium! text-[#161e2d]! leading-[1.18]! tracking-[-0.018em]!"
          >
            Before you write
          </h2>
        </Reveal>

        <ul className="mt-[26px]! max-w-3xl! border-t! border-gray-200!">
          {ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li
                key={item.q}
                className={`border-b! transition-colors! duration-200! bg-white! ${
                  isOpen ? "border-[#27427f]/30!" : "border-gray-200! hover:border-gray-300!"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`contact-faq-panel-${index}`}
                    id={`contact-faq-btn-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex! w-full! items-center! justify-between! gap-4! px-[20px]! md:px-[24px]! py-[18px]! text-left! transition-colors! duration-150! hover:bg-[#f7f9fc]!"
                  >
                    <span className="text-[14px]! md:text-[15px]! font-medium! text-[#161e2d]! leading-snug!">
                      {item.q}
                    </span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className="flex! shrink-0! items-center! justify-center! w-[32px]! h-[32px]! rounded-full! bg-[#27427f]/[0.07]! text-[#27427f]!"
                    >
                      <Plus className="w-[16px]! h-[16px]!" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="panel"
                      id={`contact-faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`contact-faq-btn-${index}`}
                      initial={
                        reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className="overflow-hidden!"
                    >
                      <p className="px-[20px]! md:px-[24px]! pb-[20px]! max-w-2xl! text-[14px]! leading-[1.7]! text-gray-600!">
                        {item.a}
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
