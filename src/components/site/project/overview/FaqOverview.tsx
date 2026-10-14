import { MessageCircleQuestion } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { FaqSection } from "@/components/site/property/sections/FaqSection";
import { Card, EmptyState } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";

/**
 * Every stored row normalized to the shape the shared accordion reads.
 * Rows without a section predate per-page FAQs and belong to overview.
 */
export function projectFaqItems(project: ProjectDetail) {
  return (project.projectFaqs ?? []).map((faq, index) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    section: faq.section || "overview",
    sortOrder: faq.sortOrder ?? index,
  }));
}

/**
 * The shared FAQ accordion when the project has answers; otherwise the same
 * slot, so the last thing on the page is still a way to ask.
 */
export function FaqOverview({ project }: { project: ProjectDetail }) {
  const faqs = projectFaqItems(project).filter((faq) => faq.section === "overview");

  if (faqs.length === 0) {
    return (
      <Card title="Frequently asked questions" id="faq">
        <EmptyState
          icon={MessageCircleQuestion}
          title="No questions answered here yet"
          body={`Ask anything about ${project.name} and our team will reply.`}
          action={<RequestButton label="Ask a question" message="" />}
        />
      </Card>
    );
  }

  return (
    <div id="faq" className="scroll-mt-32!">
      <FaqSection faqs={faqs} />
    </div>
  );
}
