import { describe, expect, it } from "vitest";
import { unitSpecGroups } from "./unit-spec-groups";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";

function unit(overrides: Partial<ProjectUnit> = {}): ProjectUnit {
  return {
    id: 1,
    unitCode: "U1",
    title: null,
    unitType: "apartment_unit",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqft: "1000",
    builtupAreaSqft: "1200",
    superBuiltupAreaSqft: "1450",
    furnishedStatus: null,
    facing: null,
    price: "60000000",
    status: "available",
    floorPlanImageUrl: null,
    isPrimary: true,
    ...overrides,
  };
}

const apartment = { projectType: "apartment" } as ProjectDetail;
const plot = { projectType: "plot" } as ProjectDetail;

describe("unitSpecGroups", () => {
  it("leads with price and area, previewed in one line", () => {
    const [price] = unitSpecGroups(unit(), apartment);
    expect(price.title).toBe("Price & area");
    expect(price.preview).toBe("₹6 Cr · 1,450 sq.ft");
    expect(price.rows.map((r) => r.label)).toEqual([
      "Price",
      "Rate",
      "Super built-up",
      "Built-up",
      "Carpet",
    ]);
  });

  it("leaves out categories with nothing recorded", () => {
    const keys = unitSpecGroups(unit(), apartment).map((g) => g.key);
    expect(keys).toEqual(["price", "rooms"]);
  });

  it("previews rooms, position, parking and furnishing in plain words", () => {
    const groups = unitSpecGroups(
      unit({
        balconies: 2,
        floorNo: 12,
        totalFloors: 15,
        facing: "north",
        parking: 1,
        parkingType: "covered",
        unitGuestParking: true,
        furnishedStatus: "semi_furnished",
        furnishingItems: [{ furnishingItem: { name: "Wardrobe" } }],
        roomDimensions: [{ name: "Master bedroom", dimensions: "12 x 14 ft" }],
      } as Partial<ProjectUnit>),
      apartment,
    );
    const preview = Object.fromEntries(groups.map((g) => [g.key, g.preview]));
    expect(preview.rooms).toBe("2 bed · 2 bath · 2 balconies");
    expect(preview.position).toBe("Floor 12 of 15 · North facing");
    expect(preview.parking).toBe("1 space · Covered · Guest");
    expect(preview.furnishing).toBe("Semi Furnished · 1 item");
    expect(groups.find((g) => g.key === "rooms")?.rooms).toEqual([
      { name: "Master bedroom", dimensions: "12′ × 14′ ft" },
    ]);
    expect(groups.find((g) => g.key === "furnishing")?.items).toEqual(["Wardrobe"]);
  });

  it("normalizes room sizes to L′ × W′, decimals included", () => {
    const groups = unitSpecGroups(
      unit({
        roomDimensions: [
          { name: "Hall", dimensions: "12.5 × 13.2 ft" },
          { name: "Kitchen", dimensions: "10x12" },
          { name: "Study", dimensions: "11′ × 12′" },
          { name: "Store", dimensions: "n/a" },
        ],
      } as Partial<ProjectUnit>),
      apartment,
    );
    expect(groups.find((g) => g.key === "rooms")?.rooms).toEqual([
      { name: "Hall", dimensions: "12.5′ × 13.2′ ft" },
      { name: "Kitchen", dimensions: "10′ × 12′ ft" },
      { name: "Study", dimensions: "11′ × 12′ ft" },
      { name: "Store", dimensions: "n/a" },
    ]);
  });

  it("groups a plot by price and plot features instead of rooms", () => {
    const groups = unitSpecGroups(
      unit({ bedrooms: null, price: "1000000", plotAreaCents: "4", facing: "east", openSides: 2 }),
      plot,
    );
    expect(groups.map((g) => g.title)).toEqual(["Price & plot", "Plot features"]);
    expect(groups[0].rows.find((r) => r.label === "Rate")?.value).toBe("₹2,50,000 / cent");
    expect(groups[1].preview).toBe("East facing · 2 open sides");
  });
});
