import { describe, expect, it } from "vitest";
import { getVisibleSingleSections } from "./property-sections";
import type { SeoProperty } from "./api/property-by-slug";

const barePlot = {
  id: 1,
  propertyType: "plot",
  title: "T",
  price: "1000000",
  city: "Coimbatore",
  state: "Tamil Nadu",
  details: null,
  images: [],
  amenities: [],
  units: [],
  faqs: [],
} as unknown as SeoProperty;

describe("getVisibleSingleSections", () => {
  it("shows only locality when nothing else has data", () => {
    expect(getVisibleSingleSections(barePlot)).toEqual(["locality"]);
  });

  it("shows amenities when at least one amenity exists", () => {
    const p = {
      ...barePlot,
      amenities: [{ id: 1, amenity: { id: 1, name: "Pool" } }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["amenities", "locality"]);
  });

  it("shows photos when at least one image exists", () => {
    const p = {
      ...barePlot,
      images: [{ id: 1, imageUrl: "/p1.jpg", imageKey: "p1", isPrimary: true, createdAt: "" }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["locality", "photos"]);
  });

  it("shows floor-plan when plan files exist", () => {
    const p = {
      ...barePlot,
      floorPlanFiles: [{ title: "Plan", imageUrl: "/plan.jpg", imageKey: "f1" }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["floor-plan", "locality"]);
  });

  it("counts section FAQs as data for that section", () => {
    const p = {
      ...barePlot,
      faqs: [{ id: 1, question: "Q", answer: "A", section: "amenities", sortOrder: 0 }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["amenities", "locality"]);
  });

  it("shows floor-plan when core measurements exist", () => {
    const p = {
      ...barePlot,
      details: { areaSqft: "1200.00" },
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["floor-plan", "locality"]);
  });
});
