"use client";

import { MessageCircleQuestion } from "lucide-react";
import { FaqAnswers } from "@/components/site/shared/FaqAnswers";
import type { ProjectDetail } from "@/lib/api/projects";
import { projectFaqItems } from "@/components/site/project/overview/faq-items";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  Panel,
  PanelEmpty,
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
      <FaqAnswers faqs={faqs} />
    </Panel>
  );
}
