import { OfferGrid } from "../shared/offer-grid";
import { ProcessSteps } from "../shared/process-steps";
import { ServiceCta } from "../shared/service-cta";
import { ServiceFaq } from "../shared/service-faq";
import { ServiceHero } from "../shared/service-hero";
import { BankPartners } from "./bank-partners";
import {
  CTA,
  FAQ,
  HERO,
  HIGHLIGHTS,
  HIGHLIGHTS_INTRO,
  PROCESS,
} from "./content";
import { EligibilityTable } from "./eligibility-table";
import { LoanDocuments } from "./loan-documents";

/**
 * Hero -> what we negotiate -> who qualifies -> what to bring -> how it runs ->
 * partners -> objections -> conversion. Eligibility comes before documents:
 * the first question is "can I get a loan", the second is "what do I need".
 */
export function FinancialAssistancePage() {
  return (
    <>
      <ServiceHero id="fa" hero={HERO} />
      <OfferGrid
        id="fa-highlights"
        intro={HIGHLIGHTS_INTRO}
        offers={HIGHLIGHTS}
        columns={4}
        tone="white"
      />
      <EligibilityTable />
      <LoanDocuments />
      <ProcessSteps id="fa-process" process={PROCESS} />
      <BankPartners />
      <ServiceFaq id="fa-faq" faq={FAQ} />
      <ServiceCta id="fa-cta" cta={CTA} />
    </>
  );
}
