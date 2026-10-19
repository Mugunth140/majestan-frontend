import { describe, expect, it } from "vitest";
import { jsonLd, seoMetadata, withSeo } from "./seo-engine";

describe("SEO engine output", () => {
  it("uses URL-specific overrides for property images and floor plans before IDs", () => {
    const property = withSeo(
      {
        canonicalSlug: "villa",
        images: [
          { id: 9, imageUrl: "https://cdn.test/shared.jpg", altText: "Existing alt" },
        ],
        floorPlanFiles: [
          { id: 9, imageKey: "floor-9", imageUrl: "https://cdn.test/floor.pdf", title: "Ground floor" },
        ],
      },
      {
        path: "/villa",
        robots_index: true,
        robots_follow: true,
        image_alt_overrides: {
          "property-image:9": "ID matched photo",
          "https://cdn.test/shared.jpg": "URL matched photo",
          "property-floor:9": "ID matched floor plan",
          "https://cdn.test/floor.pdf": "URL matched floor plan",
        },
      },
    );

    expect(property.images[0].altText).toBe("URL matched photo");
    expect((property.floorPlanFiles as Array<{ altText?: string }>)[0].altText).toBe("URL matched floor plan");
  });

  it("applies URL overrides to project photos and unit floor plans", () => {
    const project = withSeo(
      {
        canonicalSlug: "apartments",
        projectType: "apartment",
        coverImageUrl: "https://cdn.test/cover.jpg",
        galleryImageUrls: ["https://cdn.test/gallery.jpg"],
        units: [
          {
            id: 23,
            floorPlans: [
              { floorName: "Ground", imageKey: "ground-key", imageUrl: "https://cdn.test/plan.jpg" },
            ],
          },
        ],
      },
      {
        path: "/apartments",
        robots_index: true,
        robots_follow: true,
        image_alt_overrides: {
          "project-image:0": "Index collision",
          "https://cdn.test/gallery.jpg": "Gallery photo alt",
          "project-floor:23": "Unit floor alt",
          "https://cdn.test/plan.jpg": "Floor plan URL alt",
        },
      },
    );

    expect((project as typeof project & { galleryImageAltOverrides: Record<string, string> }).galleryImageAltOverrides["https://cdn.test/gallery.jpg"]).toBe("Gallery photo alt");
    const plans = project.units[0].floorPlans as Array<{ altText?: string }>;
    expect(plans[0].altText).toBe("Floor plan URL alt");
  });

  it("returns absolute SEO titles and safely escapes JSON-LD", () => {
    expect(seoMetadata({ meta_title: "Villa floor plans | Majestan Realty" }).title).toEqual({
      absolute: "Villa floor plans | Majestan Realty",
    });
    expect(jsonLd({ name: "<script>\u2028" })).toBe('{"name":"\\u003cscript>\\u2028"}');
  });
});
