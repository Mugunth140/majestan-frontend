"use client";

import { useState } from "react";
import { MessageCircleQuestion, Plus } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { projectFaqItems } from "@/components/site/project/overview/faq-items";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  BODY_TEXT,
  FOCUS_RING,
  HAIRLINE,
  INK,
  Panel,
  PanelEmpty,
  collapseClass,
} from "@/components/site/project/overview/overview-ui";

/**
 * The project's answered questions as a ruled accordion; otherwise the same
 * slot, so the last thing on the page is still a way to ask.
 */
export function FaqOverview({
  project,
  section = "overview",
  hideWhenEmpty = false,
}: {
  project: ProjectDetail;
  /** Which page's questions to show; sub-pages pass their own key. */
  section?: string;
  /** Sub-pages show nothing rather than an empty prompt. */
  hideWhenEmpty?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = projectFaqItems(project)
    .filter((faq) => faq.section === section)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (faqs.length === 0) {
    if (hideWhenEmpty) return null;
    return (
      <Panel title="Frequently asked questions" id="faq">
        <PanelEmpty
          icon={MessageCircleQuestion}
          title="No questions answered here yet"
          body={`Ask anything about ${project.name} and our team will reply.`}
          action={<RequestButton label="Ask a question" message="" tone="soft" />}
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Frequently asked questions"
      id="faq"
      action={<RequestButton label="Ask a question" message="" tone="soft" />}
    >
      <ul className={`m-0! mt-6! p-0! list-none! border-t! ${HAIRLINE}`}>
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          const answerId = `faq-answer-${faq.id}`;
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
              <div id={answerId} className={collapseClass} data-open={isOpen}>
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
    </Panel>
  );
}
