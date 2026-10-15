"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { BODY_TEXT, FOCUS_RING, HAIRLINE, INK, collapseClass } from "@/components/site/project/overview/overview-ui";

export type FaqAnswer = { id: string | number; question: string; answer: string };

/** Shared ruled accordion, with one answer open at a time. */
export function FaqAnswers({ faqs }: { faqs: FaqAnswer[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const instanceId = useId();
  return (
      <ul className={`m-0! mt-6! p-0! list-none! border-t! ${HAIRLINE}`}>
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          const answerId = `${instanceId}-answer-${faq.id}`;
          return (
            <li key={faq.id} className={`border-b! ${HAIRLINE}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? null : index)}
                className={`group/faq flex! w-full! items-center! justify-between! gap-4! border-0! bg-transparent! px-0! py-4! text-left! cursor-pointer! rounded-md! ${FOCUS_RING}`}
              >
                <span className={`text-[15px]! font-semibold! leading-snug! transition-colors! duration-150! ${INK}`}>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className={`grid! place-items-center! w-7! h-7! shrink-0! rounded-full! transition-[background-color,transform]! duration-200! ease-out-quint! ${
                    isOpen
                      ? "rotate-45! bg-[var(--ov-sky-2)]! text-[var(--ov-blue-deep)]!"
                      : "bg-[#f2f4f8]! text-[var(--ov-ink-2)]! group-hover/faq:bg-[var(--ov-sky)]! group-hover/faq:text-[var(--ov-blue)]!"
                  }`}
                >
                  <Plus className="w-4! h-4!" />
                </span>
              </button>
              <div id={answerId} className={collapseClass} data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen}>
                <div>
                  <p className={`m-0! pb-5! pr-10! text-sm! leading-relaxed! text-pretty! whitespace-pre-line! ${BODY_TEXT}`}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
  );
}
