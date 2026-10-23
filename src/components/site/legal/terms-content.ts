import type { LegalSection } from "./legal-page";

// New website terms. Commercial agreements are handled separately with the parties.
export const termsIntroduction = "These terms describe the use of the Majestan Realty website, operated by Majestan Realty Services Pvt Ltd. Please read them before using our property listings, submitting information or contacting us through the site. Our Privacy Policy explains how we handle personal information.";
export const termsSections: LegalSection[] = [
  { id: "using-the-site", title: "Using our website", blocks: [
    { type: "paragraph", text: "The website helps you explore properties and projects, connect with our team and enquire about real estate services. By using the site, you agree to use it responsibly and in accordance with these terms." },
    { type: "list", items: ["Provide accurate information when making an enquiry, creating an account or submitting a listing.", "Do not submit misleading, unlawful or unauthorised content.", "Do not interfere with the website, attempt to access other users’ accounts or misuse contact information published on the site."] },
  ] },
  { id: "property-information", title: "Property and project information", blocks: [
    { type: "paragraph", text: "Listings may include information supplied by owners, developers or other property representatives. Prices, availability, dimensions, amenities, completion dates and other details can change. Photographs, floor plans and illustrations should be read alongside the specific listing information." },
    { type: "paragraph", text: "Before making a commitment, confirm the current details with the property representative and independently verify ownership, approvals, registration details, measurements and documents relevant to your transaction. A listing or enquiry does not reserve a property or create a sale or rental agreement." },
  ] },
  { id: "enquiries-and-visits", title: "Enquiries and site visits", blocks: [
    { type: "paragraph", text: "When you request information or a site visit, provide contact details that belong to you or that you are authorised to use. Our team may contact you about your request. Visit times depend on confirmation and property access, and may need to be rescheduled." },
  ] },
  { id: "posting-a-property", title: "Posting a property", blocks: [
    { type: "paragraph", text: "Submit a property only if you own it or have permission to represent it. You are responsible for the accuracy of the description, pricing, photographs and documents you provide, and for having permission to share that material." },
    { type: "paragraph", text: "We may request clarification, correct information with you, or decline or remove listings that are inaccurate, unauthorised, duplicated or otherwise unsuitable for the website. Submitting a listing does not guarantee publication, enquiries or a completed transaction." },
  ] },
  { id: "pricing-and-calculators", title: "Prices, fees and calculators", blocks: [
    { type: "paragraph", text: "Displayed prices and estimates are for reference. Confirm the applicable price, taxes, charges, deposits and any service fees before proceeding. Any fees for a service must be agreed separately; browsing a listing does not by itself establish a service agreement." },
    { type: "paragraph", text: "EMI calculations are estimates based on the amounts, interest rate and tenure entered. They are not a loan offer or approval. A lender determines eligibility, the final interest rate, fees and repayment terms." },
  ] },
  { id: "accounts-and-content", title: "Accounts and website content", blocks: [
    { type: "paragraph", text: "Keep your account credentials private and let our team know if you suspect unauthorised access. Do not use another person’s account without permission." },
    { type: "paragraph", text: "The website’s branding, design and content belong to Majestan Realty or their respective owners. Do not republish photographs, listings or other material for commercial use without permission from the relevant owner." },
  ] },
  { id: "external-services", title: "Links and external services", blocks: [
    { type: "paragraph", text: "The website may link to maps, messaging platforms, lenders or other external services. These services have their own terms and privacy practices. Review those terms before sharing information or making a commitment through them." },
  ] },
  { id: "separate-agreements", title: "Property transactions and agreements", blocks: [
    { type: "paragraph", text: "Purchases, rentals, bookings, loans and professional services require their own verification and agreements with the relevant parties. The website does not replace transaction documents or independent legal, financial or technical advice. Your rights under applicable law continue to apply." },
  ] },
  { id: "changes-and-contact", title: "Updates and contact", blocks: [
    { type: "paragraph", text: "We may update the website and these terms from time to time. Changes will be published on this page. If you have questions about these terms or need clarification before using a service, contact us at info@majestanrealty.com or through our Contact Us page." },
  ] },
];
