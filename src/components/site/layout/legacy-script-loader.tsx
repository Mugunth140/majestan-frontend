"use client";

import Script from "next/script";

const LEGACY_SCRIPT_SOURCES = [
  "/assets/js/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "/assets/js/bootstrap.min.js",
  "/assets/js/lazysize.min.js",
  "/assets/js/wow.min.js",
  "/assets/js/jquery.nice-select.min.js",
  "/assets/js/odometer.min.js",
  "/assets/js/counter.js",
  "/assets/js/swiper-bundle.min.js",
  "/assets/js/swiper.js",
  "/assets/js/simpleParallaxVanilla.umd.js",
  "/assets/js/gsap.min.js",
  "/assets/js/rangle-slider.js",
  "/assets/js/Splitetext.js",
  "/assets/js/ScrollTrigger.min.js",
  "/assets/js/jquery.fancybox.js",
  "/assets/js/main.js",
] as const;

export function LegacyScriptLoader(): React.JSX.Element {
  return (
    <>
      {LEGACY_SCRIPT_SOURCES.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </>
  );
}
