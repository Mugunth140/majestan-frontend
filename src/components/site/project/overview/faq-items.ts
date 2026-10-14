import type { ProjectDetail } from "@/lib/api/projects";

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
