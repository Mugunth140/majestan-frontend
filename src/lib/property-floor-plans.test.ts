import { describe, expect, it } from "vitest";
import type { SeoProperty } from "./api/property-by-slug";
import { getPropertyFloorPlans } from "./property-floor-plans";

describe("Named property floor plans", () => {
  it("preserves floor names and order across documents, detail drawings and unit plans", () => {
    const property = { propertyType: "apartment",
      floorPlanFiles: [{ title: "Ground floor", imageUrl: "/g.png?token=1", imageKey: "g.png" }],
      details: { floorPlanImages: [
        { title: "Old duplicate", imageUrl: "/g.png?token=2", imageKey: "g.png" },
        { title: "First floor", imageUrl: "/f.PDF?token=1", imageKey: "f.PDF" },
      ] },
      units: [{ title: "Second floor", floorPlanImageUrl: "/s.png" }],
    } as SeoProperty;
    expect(getPropertyFloorPlans(property).map(({ title, isPdf }) => [title, isPdf]))
      .toEqual([["Ground floor", false], ["First floor", true], ["Second floor", false]]);
  });
});
