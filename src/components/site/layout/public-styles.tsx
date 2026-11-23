"use client";
import { usePathname } from "next/navigation";
import { LEGACY_CSS_HREF } from "./legacy-css";

// The old theme CSS (Bootstrap, animate, swiper-bundle, sib-styles, styles) as
// one trimmed, minified, content-hashed file built by
// scripts/build-legacy-css.mjs. It replaced seven render-blocking requests
// (~89 KB gzip) with one (~28 KB) for mobile LCP. Rebuild it after adding
// markup that relies on classes from those stylesheets.
export function PublicStyles() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <link rel="stylesheet" href={LEGACY_CSS_HREF} />;
}
