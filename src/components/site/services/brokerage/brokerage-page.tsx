import { CategoryRail } from "../liaisoning/category-rail";
import { ProcessSteps } from "../shared/process-steps";
import { ServiceCta } from "../shared/service-cta";
import { ServiceFaq } from "../shared/service-faq";
import { ServiceHero } from "../shared/service-hero";
import { CTA, FAQ, HERO, PROCESS, SEGMENTS, SEGMENTS_INTRO } from "./content";

/** Hero -> segments covered -> how a deal runs -> objections -> conversion. */
export function BrokeragePage() {
  return (
    <>
      <ServiceHero id="brokerage" hero={HERO} />
      <CategoryRail
        categories={SEGMENTS}
        title={SEGMENTS_INTRO.title}
        description={SEGMENTS_INTRO.description}
        ariaLabel="Brokerage transactions by segment"
        idPrefix="brokerage"
      />
      <ProcessSteps id="brokerage-process" process={PROCESS} tone="white" />
      <ServiceFaq id="brokerage-faq" faq={FAQ} />
      <ServiceCta id="brokerage-cta" cta={CTA} />
    </>
  );
}
