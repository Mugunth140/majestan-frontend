import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSeoForDetail,
  jsonLd,
  seoMetadata,
  withSeo,
  listingStructuredData,
} from "./seo-engine";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  },
}));

describe("SEO engine output", () => {
  it("uses URL-specific overrides for property images and floor plans before IDs", () => {
    const property = withSeo(
      {
        canonicalSlug: "villa",
        images: [
          {
            id: 9,
            imageUrl: "https://cdn.test/shared.jpg",
            altText: "Existing alt",
          },
        ],
        floorPlanFiles: [
          {
            id: 9,
            imageKey: "floor-9",
            imageUrl: "https://cdn.test/floor.pdf",
            title: "Ground floor",
          },
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
    expect(
      (property.floorPlanFiles as Array<{ altText?: string }>)[0].altText,
    ).toBe("URL matched floor plan");
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
              {
                floorName: "Ground",
                imageKey: "ground-key",
                imageUrl: "https://cdn.test/plan.jpg",
              },
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

    expect(
      (
        project as typeof project & {
          galleryImageAltOverrides: Record<string, string>;
        }
      ).galleryImageAltOverrides["https://cdn.test/gallery.jpg"],
    ).toBe("Gallery photo alt");
    const plans = project.units[0].floorPlans as Array<{ altText?: string }>;
    expect(plans[0].altText).toBe("Floor plan URL alt");
  });

  it("returns absolute SEO titles and safely escapes JSON-LD", () => {
    expect(
      seoMetadata({ meta_title: "Villa floor plans | Majestan Realty" }).title,
    ).toEqual({
      absolute: "Villa floor plans | Majestan Realty",
    });
    expect(jsonLd({ name: "<script>\u2028" })).toBe(
      '{"name":"\\u003cscript>\\u2028"}',
    );
  });
});

describe("structured media SEO", () => {
  it("applies accessible media attributes without injecting visible SEO captions", () => {
    const input = {
      title: "Original title",
      status: "available",
      canonicalSlug: "original",
      images: [{ id: 5, imageUrl: "https://cdn.test/photo.jpg" }],
      floorPlanFiles: [{ id: 8, imageUrl: "https://cdn.test/floor.jpg" }],
    };
    const output = withSeo(input, {
      path: "/custom",
      image_alts: {
        "property-image:5": {
          alt_text: "Entry",
          title_text: "Main entrance",
          caption: "East-facing entrance",
        },
        "property-floor:8": {
          alt_text: "Ground floor",
          title_text: "Ground floor layout",
          caption: "Two bedrooms",
        },
      },
    });
    expect(output.images[0]).toMatchObject({
      altText: "Entry",
      titleText: "Main entrance",
    });
    expect(output.floorPlanFiles[0]).toMatchObject({
      altText: "Ground floor",
      titleText: "Ground floor layout",
    });
    expect(input.images[0]).not.toHaveProperty("caption");
    expect(output.images[0]).not.toHaveProperty("caption");
    expect(output.floorPlanFiles[0]).not.toHaveProperty("caption");
    expect(output.status).toBe("available");
  });
});

describe("listing schema follows the visible page", () => {
  it("keeps metadata and breadcrumbs while excluding hidden FAQs and replacing old inventory results", () => {
    const current = {
      "@type": "ItemList",
      itemListElement: [{ name: "Visible property" }],
    };
    const schema = listingStructuredData(
      {
        json_ld: {
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", name: "Apartments for sale" },
            { "@type": "BreadcrumbList", itemListElement: [] },
            {
              "@type": "FAQPage",
              mainEntity: [{ name: "Hidden automatic question" }],
            },
            {
              "@type": "ItemList",
              itemListElement: [{ name: "Stale result" }],
            },
          ],
        },
      },
      current,
    );
    expect(JSON.stringify(schema)).toContain("Apartments for sale");
    expect(JSON.stringify(schema)).toContain("BreadcrumbList");
    expect(JSON.stringify(schema)).toContain("Visible property");
    expect(JSON.stringify(schema)).not.toContain("FAQPage");
    expect(JSON.stringify(schema)).not.toContain("Stale result");
  });
});

describe("strict detail SEO failures", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("turns invalid public paths into not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 400 })),
    );
    await expect(getSeoForDetail("/invalid-path-ap001")).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    );
  });
  it("keeps real upstream outages fatal instead of caching incomplete metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
    );
    await expect(getSeoForDetail("/valid-ap001")).rejects.toThrow(
      "Public SEO lookup failed: 500",
    );
  });
});
