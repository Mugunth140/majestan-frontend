import { LegalPage } from "@/components/site/legal/legal-page";
import { privacyIntroduction, privacySections } from "@/components/site/legal/privacy-content";

export function PrivacyPolicyView() {
  return <LegalPage kind="privacy" introduction={privacyIntroduction} sections={privacySections} />;
}
