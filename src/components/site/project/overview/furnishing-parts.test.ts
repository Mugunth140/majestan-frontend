import { describe, expect, it } from "vitest";
import { Archive, BedDouble, Snowflake, Sofa } from "lucide-react";
import { furnishingIconFor } from "./furnishing-parts";
import { unitFurnishingItems } from "@/lib/project-overview";
import type { ProjectUnit } from "@/lib/api/projects";

describe("furnishingIconFor", () => {
  it("resolves the CRM's stored PascalCase icon names", () => {
    expect(furnishingIconFor("Archive", "Wardrobe")).toBe(Archive);
    expect(furnishingIconFor("BedDouble", "King bed")).toBe(BedDouble);
  });

  it("falls back on the item's name, then a sofa", () => {
    expect(furnishingIconFor(null, "Split AC")).toBe(Snowflake);
    expect(furnishingIconFor("not-an-icon", "Wardrobe")).toBe(Archive);
    expect(furnishingIconFor(undefined, "Mystery item")).toBe(Sofa);
  });
});

describe("unitFurnishingItems", () => {
  it("reads the items the API sends and the older link rows alike", () => {
    const unit = {
      furnishingItems: [
        { id: 1, name: "Sofa", icon: "Sofa" },
        { furnishingItemId: 2, furnishingItem: { id: 2, name: " Wardrobe ", icon: "Archive" } },
        { furnishingItemId: 3, furnishingItem: null },
      ],
    } as unknown as ProjectUnit;
    expect(unitFurnishingItems(unit).map((item) => item.name)).toEqual(["Sofa", "Wardrobe"]);
  });
});
