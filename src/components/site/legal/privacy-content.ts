import type { LegalSection } from "./legal-page";

// Existing published privacy policy, preserved from the legacy view.
export const privacyIntroduction = "At Majestan Realty Services Pvt Ltd (“we,” “us,” or “our”), we are committed to protecting the privacy and security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website majestanrealty.com (“the Site”). By accessing or using our Site, you agree to the terms outlined in this Privacy Policy.";

export const privacySections: LegalSection[] = [
  {
    "id": "information",
    "title": "Information We Collect",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Personal Information When you use our Site, fill out forms, or communicate with us, we may collect personal information that you voluntarily provide, such as:"
      },
      {
        "type": "list",
        "items": [
          "Name",
          "Email address",
          "Contact number",
          "Mailing address",
          "Preferences and interests related to real estate",
          "Any additional information you provide"
        ]
      },
      {
        "type": "paragraph",
        "text": "Non-Personal Information We also collect certain non-personal information automatically, such as:"
      },
      {
        "type": "list",
        "items": [
          "IP address",
          "Browser type and version",
          "Operating system",
          "Pages visited on our Site",
          "Date and time of your visit",
          "Referring websites and links clicked"
        ]
      }
    ]
  },
  {
    "id": "use",
    "title": "How We Use Your Information",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We may use the information we collect for purposes that include:"
      },
      {
        "type": "list",
        "items": [
          "Providing Services: To respond to your inquiries and provide information about our real estate projects.",
          "Improving the Site: To enhance functionality, performance, and user experience.",
          "Marketing: With your consent, to send updates and promotional materials. You may opt out at any time.",
          "Legal Compliance: To comply with applicable laws and regulations."
        ]
      }
    ]
  },
  {
    "id": "sharing",
    "title": "Sharing Your Information",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We respect your privacy and do not sell your personal information. We may share information only in the following cases:"
      },
      {
        "type": "list",
        "items": [
          "Service Providers: Third-party vendors such as hosting, analytics, and payment services.",
          "Legal Requirements: If required by law or government authorities.",
          "Business Transfers: In the event of a merger, acquisition, or sale of assets."
        ]
      }
    ]
  },
  {
    "id": "cookies",
    "title": "Cookies and Tracking Technologies",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We use cookies and similar technologies to analyze traffic and improve user experience. You may disable cookies through your browser settings, but some features may not function properly."
      }
    ]
  },
  {
    "id": "security",
    "title": "Data Security",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We implement appropriate technical and organizational measures to protect your data. However, no method of transmission over the internet is 100% secure, and absolute security cannot be guaranteed."
      }
    ]
  },
  {
    "id": "external-links",
    "title": "Third-Party Links",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Our Site may contain links to third-party websites. We are not responsible for their privacy practices, and we encourage you to review their privacy policies separately."
      }
    ]
  },
  {
    "id": "children",
    "title": "Children’s Privacy",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Our Site is not intended for children under the age of 13. We do not knowingly collect personal information from children."
      }
    ]
  },
  {
    "id": "your-rights",
    "title": "Your Rights",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Depending on your jurisdiction, you may have the following rights:"
      },
      {
        "type": "list",
        "items": [
          "Access to your personal data",
          "Correction of inaccurate or incomplete data",
          "Deletion of your personal data",
          "Opt-out of marketing communications"
        ]
      },
      {
        "type": "paragraph",
        "text": "To exercise these rights, contact us at info@majestanrealty.com ."
      }
    ]
  },
  {
    "id": "updates",
    "title": "Updates to This Privacy Policy",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We may update this Privacy Policy periodically. Any changes will be posted on this page. Continued use of the Site indicates acceptance of the updated policy."
      }
    ]
  }
];
