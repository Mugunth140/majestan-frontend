import { OfferGrid } from "../shared/offer-grid";
import { ProcessSteps } from "../shared/process-steps";
import { ServiceCta } from "../shared/service-cta";
import { ServiceFaq } from "../shared/service-faq";
import { ServiceHero } from "../shared/service-hero";
import {
  ADVANTAGES,
  ADVANTAGES_INTRO,
  CTA,
  FAQ,
  HERO,
  PROCESS,
} from "./content";

/** Hero -> what we cover -> how it runs from abroad -> objections -> conversion. */
export function NriPage() {
  return (
    <>
      <ServiceHero id="nri" hero={HERO} />
      <OfferGrid
        id="nri-advantages"
        intro={ADVANTAGES_INTRO}
        offers={ADVANTAGES}
        tone="white"
      />
      <ProcessSteps id="nri-process" process={PROCESS} />
      <ServiceFaq id="nri-faq" faq={FAQ} />
      <ServiceCta id="nri-cta" cta={CTA} />
    </>
  );
}
