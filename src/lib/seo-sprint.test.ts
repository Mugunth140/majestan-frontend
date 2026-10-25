import { describe, it, expect } from "vitest";
import { withSeo } from "./seo-engine";
import { hasSectionData, sectionMetadata } from "./seo-section-data";
import { buildRealEstateSchema } from "./schema-builder";
describe("public SEO behavior", () => {
  it("preserves a path redirect and target", () => {
    expect(
      withSeo({ canonicalSlug: "old" }, { redirect: "/new" }),
    ).toMatchObject({ shouldRedirect: true, redirectDestination: "/new" });
  });
  it("does not redirect available inventory just because it has an expiry policy", () => {
    expect(
      withSeo(
        { status: "available" },
        {
          path: "/home",
          settings: {
            expired_redirect_policy: "redirect_to_locality",
            redirect_target_path: "/apartments",
          },
        },
      ).shouldRedirect,
    ).toBe(false);
  });
  it("keeps off-market inventory live despite a saved redirect policy", () => {
    expect(
      withSeo(
        { status: "expired" },
        {
          path: "/home",
          settings: {
            expired_redirect_policy: "redirect_to_locality",
            redirect_target_path: "/apartments",
          },
        },
      ).shouldRedirect,
    ).toBe(false);
  });
  it("noindexes an empty floor plan and canonicalizes it to the overview", () => {
    const r = { canonicalSlug: "home", units: [] };
    expect(hasSectionData(r, "floor-plans")).toBe(false);
    expect(sectionMetadata(r, "floor-plans", {})).toMatchObject({
      robots: { index: false, follow: true },
      alternates: { canonical: "https://www.majestanrealty.com/home" },
    });
  });
  it("keeps a section without inventory noindex even with SEO-only intro text and selects its floor plan image", () => {
    const r = {
      canonicalSlug: "home",
      seoEngine: {
        section_seo: { floor_plans: { intro_text: "Layout guide" } },
      },
      units: [],
    };
    expect(
      sectionMetadata(r, "floor-plan", {
        robots: { index: true, follow: true },
      }).robots,
    ).toMatchObject({ index: false });
    expect(
      hasSectionData(
        {
          ...r,
          units: [
            { floorPlans: [{ imageUrl: "https://example.com/plan.jpg" }] },
          ],
        },
        "floor-plans",
      ),
    ).toBe(true);
  });
  it("generates sold offers, geography and custom graph nodes", () => {
    const graph = buildRealEstateSchema(
      {
        title: "Home",
        canonicalSlug: "home",
        propertyType: "apartment",
        status: "sold",
        price: "5000000",
        city: "Coimbatore",
        locations: [{ latitude: 11, longitude: 77 }],
      },
      {
        off_market: true,
        schema_overrides: { "@type": "WebPage", name: "Custom" },
      },
    )["@graph"];
    expect(
      graph.find((n) => n["@type"] === "RealEstateListing")?.offers
        .availability,
    ).toBe("https://schema.org/SoldOut");
    expect(graph.find((n) => n["@type"] === "Apartment")?.geo.latitude).toBe(
      11,
    );
    expect(graph.some((n) => n.name === "Custom")).toBe(true);
  });
});
