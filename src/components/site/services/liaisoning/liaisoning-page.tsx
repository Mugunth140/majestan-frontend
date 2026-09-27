import { CategoryRail } from "./category-rail";
import { GeneralLiaisoning } from "./general-liaisoning";
import { LiaisoningCta } from "./liaisoning-cta";
import { LiaisoningFaq } from "./liaisoning-faq";
import { LiaisoningHero } from "./liaisoning-hero";
import { ProcessSteps } from "./process-steps";

/**
 * Section order is deliberate: hero -> proof of coverage (the 19 asset classes)
 * -> the actual authority map -> how the work actually runs -> objections
 * handled -> conversion. The objection handling sits *above* the CTA on purpose;
 * the pricing question is the reason people hesitate, and answering it before
 * asking for the callback is what makes the ask reasonable.
 */
export function LiaisoningPage() {
  return (
    <>
      <LiaisoningHero />
      <CategoryRail />
      <GeneralLiaisoning />
      <ProcessSteps />
      <LiaisoningFaq />
      <LiaisoningCta />
    </>
  );
}
