/**
 * src/lib/seo/pseo-parser.ts
 *
 * Re-exports the canonical PSEO slug parser from seo-urls.ts.
 * The stub that lived here has been replaced.
 *
 * `[slug]/page.tsx` imports `parsePseoSlug` and `ParsedPseoData` from here,
 * so we keep the module path but forward to the authoritative implementation.
 */

export {
  parsePseoSlug,
  type ParsedPseoSlug as ParsedPseoData,
} from "@/lib/seo-urls";
