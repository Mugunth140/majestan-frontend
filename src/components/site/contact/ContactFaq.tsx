"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/components/site/shared/use-prefers-reduced-motion";
import { Reveal } from "@/components/site/shared/reveal";
import { DETAILS } from "./content";

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
    <section className="mt-16! md:mt-24!" aria-labelledby="contact-faq-heading">
      <div className="grid! grid-cols-1! gap-8! lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]! lg:gap-16!">
        <Reveal>
          <h2
            id="contact-faq-heading"
            className="m-0! text-[clamp(24px,2.6vw,32px)]! font-semibold! text-[#0a0f1c]! leading-tight! tracking-[-0.03em]!"
          >
            Before you write
          </h2>
          <p className="m-0! mt-3! max-w-[36ch]! text-[15px]! leading-[1.65]! text-[#465066]!">
            Quick answers to what people usually ask first. Anything else, call us on{" "}
            <a href={DETAILS.phone.href} className="font-semibold! text-[#0a0f1c]! no-underline! hover:underline! underline-offset-4!">
              {DETAILS.phone.value}
            </a>
            .
          </p>
        </Reveal>

        <ul className="m-0! list-none! rounded-2xl! border! border-[#e6ebf2]! bg-white! px-5! md:px-7!">
          {ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={item.q} className={index > 0 ? "border-t! border-[#eef1f6]!" : ""}>
                <h3 className="m-0!">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`contact-faq-panel-${index}`}
                    id={`contact-faq-btn-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group/faq flex! w-full! items-center! justify-between! gap-4! border-0! bg-transparent! py-[18px]! text-left! cursor-pointer! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! rounded-md!"
                  >
                    <span className="text-[15px]! font-semibold! text-[#0a0f1c]! leading-snug!">{item.q}</span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className={`flex! h-[30px]! w-[30px]! shrink-0! items-center! justify-center! rounded-full! transition-colors! duration-150! ${
                        isOpen
                          ? "bg-[#dce8ff]! text-[#1645bf]!"
                          : "bg-[#f2f4f8]! text-[#1c2433]! group-hover/faq:bg-[#eef4ff]! group-hover/faq:text-[#2563eb]!"
                      }`}
                    >
                      <Plus className="h-[16px]! w-[16px]!" />
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
                      initial={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : HEIGHT_SPRING}
                      className="overflow-hidden!"
                    >
                      <p className="m-0! max-w-2xl! pb-[20px]! pr-10! text-[14px]! leading-[1.7]! text-[#465066]!">
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
