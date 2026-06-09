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
  return (
    <html lang="en">
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="shortcut icon" href="/assets/images/logo/fav.png" />
        <link rel="apple-touch-icon-precomposed" href="/assets/images/logo/fav.png" />
      </head>
      <body className="theme-color-3 majestan-app-root" suppressHydrationWarning>
        <QueryProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
