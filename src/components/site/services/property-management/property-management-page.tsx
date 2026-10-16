import { OfferGrid } from "../shared/offer-grid";
import { ProcessSteps } from "../shared/process-steps";
import { ServiceCta } from "../shared/service-cta";
import { ServiceFaq } from "../shared/service-faq";
import { ServiceHero } from "../shared/service-hero";
import {
  CTA,
  FAQ,
  HERO,
  PROCESS,
  REASONS,
  REASONS_INTRO,
  SERVICES,
  SERVICES_INTRO,
} from "./content";

/** Hero -> what we manage -> how it runs -> why us -> objections -> conversion. */
export function PropertyManagementPage() {
  return (
    <>
      <ServiceHero id="pm" hero={HERO} />
      <OfferGrid
        id="pm-services"
        intro={SERVICES_INTRO}
        offers={SERVICES}
        tone="white"
      />
      <ProcessSteps id="pm-process" process={PROCESS} />
      <OfferGrid
        id="pm-reasons"
        intro={REASONS_INTRO}
        offers={REASONS}
        tone="white"
      />
      <ServiceFaq id="pm-faq" faq={FAQ} />
      <ServiceCta id="pm-cta" cta={CTA} />
    </>
  );
}
