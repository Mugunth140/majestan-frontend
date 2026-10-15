"use client";

import type { SeoPropertyFaq } from "@/lib/api/property-by-slug";
import { FaqAnswers } from "@/components/site/shared/FaqAnswers";
import { OV_ROOT, Panel } from "@/components/site/project/overview/overview-ui";

export function FaqSection({ faqs }: { faqs: SeoPropertyFaq[] }) {
  if (!faqs?.length) return null;
  const sorted = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <Panel title="Frequently Asked Questions" id="faq" className={OV_ROOT}>
      <FaqAnswers faqs={sorted} />
    </Panel>
  );
}
