import { permanentRedirect } from "next/navigation";
import { parseListingUrl, buildPseoSlug } from "@/lib/seo-urls";
import type { Metadata } from "next";

/**
 * This route exists solely to issue 301 permanent redirects from the old PSEO
 * URL format to the new canonical format.
 *
 * OLD: /for-rent/villas/coimbatore/saravanampatti/3-bhk
 * NEW: /3-bhk-villas-for-rent-in-saravanampatti-coimbatore
 *
 * All rendering has moved to /[slug]/page.tsx.
 * Do not add any UI here.
 */

type Props = {
  params: Promise<{
    propertyType: string;
    location: string[];
  }>;
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Redirect-only route: never statically prerender. Prerendering a component
// that unconditionally throws permanentRedirect breaks Next's render-timing
// measurement ("...cannot have a negative time stamp" TypeError).
export const dynamic = "force-dynamic";

export default async function ForRentRedirect({ params }: Props) {
  const p = await params;
  const parsed = parseListingUrl("for-rent", p.propertyType, p.location);

  if (!parsed) {
    // Unknown property type — fall back to homepage
    permanentRedirect("/");
  }

  const newSlug = buildPseoSlug(
    parsed.apiListingType,
    parsed.propertyTypeSlug,
    parsed.city,
    parsed.locality,
    parsed.bedrooms
  );

  permanentRedirect(`/${newSlug}`);
}
