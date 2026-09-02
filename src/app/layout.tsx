/* eslint-disable @next/next/no-css-tags */
import type { Metadata, Viewport } from "next";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.majestanrealty.com"),
  title: {
    default: "Majestan Realty | Properties in Coimbatore",
    template: "%s | Majestan Realty",
  },
  description:
    "Buy, rent, and sell apartments, villas, plots, commercial spaces, and industrial properties in Coimbatore with Majestan Realty.",
  applicationName: "Majestan Realty",
  keywords: [
    "Coimbatore real estate",
    "apartments in Coimbatore",
    "villas in Coimbatore",
    "plots in Coimbatore",
    "commercial property Coimbatore",
    "industrial property Coimbatore",
    "Majestan Realty",
  ],
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
    other: [
      { rel: "shortcut icon", url: "/favicon/favicon.ico" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.majestanrealty.com",
    siteName: "Majestan Realty",
    title: "Majestan Realty | Properties in Coimbatore",
    description:
      "Trusted real estate partner for buying, renting, and selling properties in Coimbatore.",
    images: [
      {
        url: "/assets/images/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Majestan Realty",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majestan Realty | Properties in Coimbatore",
    description:
      "Browse verified property listings and services in Coimbatore with Majestan Realty.",
    images: ["/assets/images/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { QueryProvider } from "@/providers/query-provider";
import { LocationProvider } from "@/contexts/LocationContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://www.majestanrealty.com#organization",
    name: "Majestan Realty",
    url: "https://www.majestanrealty.com",
    logo: "https://www.majestanrealty.com/assets/images/logo/logo.png",
    image: "https://www.majestanrealty.com/assets/images/logo/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Coimbatore",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/majestanrealty",
      "https://www.instagram.com/majestanrealty",
      "https://www.linkedin.com/company/majestanrealty",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.majestanrealty.com#website",
    url: "https://www.majestanrealty.com",
    name: "Majestan Realty",
    publisher: { "@id": "https://www.majestanrealty.com#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.majestanrealty.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en-IN" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="stylesheet" type="text/css" href="/assets/css/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/animate.min.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/magnific-popup.min.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/odometer.min.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/sib-styles.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/styles.css" />
        <link rel="stylesheet" type="text/css" href="/assets/icons/icomoon/style.css" />
        <link
          rel="preconnect"
          href="https://cdnjs.cloudflare.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://prismarkcrm.in" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      </head>
      <body className="theme-color-3 majestan-app-root" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <QueryProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
