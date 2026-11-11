import type { LegalSection } from "./legal-page";

// How people ask us to delete their data (linked from the Meta app settings).
export const dataDeletionIntroduction = "You can ask Majestan Realty Services Pvt Ltd to delete the personal information we hold about you, including what you shared on this website and in WhatsApp conversations with us. This page explains what we delete and how to send a request.";
export const dataDeletionSections: LegalSection[] = [
  { id: "what-we-delete", title: "What we delete", blocks: [
    { type: "paragraph", text: "When we receive your request, we delete the personal information linked to your mobile number or email address, including:" },
    { type: "list", items: [
      "Your website account and saved properties",
      "Enquiries, callback and site visit requests",
      "WhatsApp messages exchanged with Majestan Realty and your WhatsApp opt-in",
      "Contact details, preferences and notes our team kept about your enquiries",
    ] },
  ] },
  { id: "how-to-request", title: "How to request deletion", blocks: [
    { type: "paragraph", text: "Use either of these options:" },
    { type: "list", items: [
      "Email info@majestanrealty.com with the subject \"Data deletion request\". Include your name and the mobile number or email address you used with us.",
      "Send \"Delete my data\" to Majestan Realty on WhatsApp from the number you used with us.",
    ] },
    { type: "paragraph", text: "We may ask you to confirm the request from that same email address or number, so that nobody else can delete your information." },
  ] },
  { id: "what-happens-next", title: "What happens next", blocks: [
    { type: "paragraph", text: "We confirm that we received your request within 7 days and complete the deletion within 30 days. We tell you when it is done. After deletion we stop sending you WhatsApp messages and emails, and you would need to sign up or enquire again to use our services." },
  ] },
  { id: "what-we-keep", title: "Information we may keep", blocks: [
    { type: "paragraph", text: "We may keep records we are required to hold by law, such as invoices, booking and payment records, and agreements, for as long as the law requires. These records are not used to contact you." },
  ] },
  { id: "questions", title: "Questions", blocks: [
    { type: "paragraph", text: "For questions about your data or this process, write to info@majestanrealty.com. Our Privacy Policy explains how we collect and use personal information." },
  ] },
];
