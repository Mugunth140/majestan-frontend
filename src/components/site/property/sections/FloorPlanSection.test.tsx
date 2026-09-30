// site/majestan-frontend/src/components/site/property/sections/FloorPlanSection.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { FloorPlanSection } from "./FloorPlanSection";
import type { SeoProperty } from "@/lib/api/property-by-slug";

afterEach(cleanup);

const property = {
  id: 18,
  propertyType: "apartment",
  title: "T",
  price: "10000000",
  city: "Coimbatore",
  state: "Tamil Nadu",
  status: "Available",
  details: {
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: "1456.00",
    parking: 0,
    furnished: false,
    floorPlanImages: [{ title: "Detail plan", imageUrl: "/details-plan.jpg", imageKey: "d1" }],
  },
  units: [
    { id: 9, title: "Unit plan", unitType: "3bhk", floorPlanImageUrl: "/unit-plan.jpg", floorPlanImageKey: "u1" },
  ],
  floorPlanFiles: [{ title: "Uploaded plan", imageUrl: "/uploaded-plan.jpg", imageKey: "f1" }],
} as unknown as SeoProperty;

describe("FloorPlanSection gallery", () => {
  it("shows every source — uploaded files first, then detail plans, then unit plans", () => {
    render(<FloorPlanSection property={property} />);

    const srcs = screen
      .getAllByRole("img")
      .map((el) => el.getAttribute("src"))
      .filter((src) => src?.includes("-plan.jpg"));
    expect(srcs).toEqual(["/uploaded-plan.jpg", "/details-plan.jpg", "/unit-plan.jpg"]);
  });
});
