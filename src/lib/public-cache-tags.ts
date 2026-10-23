// Public data only. Account, admin and enquiry responses must never use these tags.
export const SEO_CONTENT_TAG = "public-seo";
export const SEO_ORGANIZATION_TAG = "public-organization";
export const INVENTORY_TAG = "public-inventory";

export function seoPathTags(path: string): string[] {
  const tag = `seo-path:${path}`;
  return tag.length <= 256 ? [tag] : [];
}

export function seoEndpointTags(endpoint: string): string[] {
  if (endpoint === "organization") return [SEO_ORGANIZATION_TAG];
  const url = new URL(endpoint, "https://seo.internal/");
  const path = url.searchParams.get("path");
  return [SEO_CONTENT_TAG, ...(path ? seoPathTags(path) : [])];
}
