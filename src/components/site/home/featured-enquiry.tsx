"use client";

import type { FeaturedProperty } from "@/lib/api";
import { PropertyEnquiryActions, type EnquiryPropertyRef } from "@/components/site/property/PropertyEnquiryActions";

export type FeaturedEnquiryRequest = { property: FeaturedProperty; token: number };

/**
 * The home-page cards' Enquire button opens the same dialog as the listing
 * and detail pages: signed-in visitors see their saved name and phone instead
 * of a blank form, signed-out visitors verify by OTP first, and the enquiry is
 * linked to the property in the CRM. Each click carries a fresh token so the
 * same card can be reopened.
 */
export function FeaturedEnquiry({ request }: { request: FeaturedEnquiryRequest | null }) {
  if (!request) return null;
  const { property } = request;
  const ref: EnquiryPropertyRef = {
    id: property.id,
    propertyCode: null,
    slug: property.slugUrl,
    title: property.propertyName ?? "Property",
    propertyType: property.propertyType,
    listingType: property.postType ?? "",
    city: property.sublocation ?? "",
  };
  return (
    <PropertyEnquiryActions
      property={ref}
      hideTriggers
      externalOpen={{ intent: "enquire", token: request.token }}
    />
  );
}
