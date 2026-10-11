import { MessageCircleQuestion } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { FaqSection } from "@/components/site/property/sections/FaqSection";
import { Card, EmptyState } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";

/**
 * The shared FAQ accordion when the project has answers; otherwise the same
 * slot, so the last thing on the page is still a way to ask.
 */
export function FaqOverview({ project }: { project: ProjectDetail }) {
  const faqs = project.projectFaqs ?? [];

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
      <FaqSection
        faqs={faqs.map((faq, index) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          section: "overview",
          sortOrder: faq.sortOrder ?? index,
        }))}
      />
    </div>
  );
}
