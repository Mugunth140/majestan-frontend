import { describe, it, expect } from "vitest";
import { getPlaceholderImage, getAllPlaceholderImages } from "./placeholder-images";

describe("getPlaceholderImage", () => {
  it.each([
    ["apartment", "Apartment.webp"],
    ["villa", "Villa.webp"],
    ["individual_portion", "Independent-house.webp"],
    ["independent-house", "Independent-house.webp"],
    ["plot", "Plot.webp"],
    ["farmland", "Farmland.webp"],
    ["commercial", "Commercial.webp"],
    ["commercial-space", "Commercial.webp"],
    ["industrial", "Industrial.webp"],
    ["industrial-space", "Industrial.webp"],
    ["coworking", "Coworking.webp"],
  ])("maps %s to %s", (type, file) => {
    expect(getPlaceholderImage({ propertyType: type })).toBe(`/assets/placeholder/${file}`);
  });

  it("is case/whitespace tolerant", () => {
    expect(getPlaceholderImage({ propertyType: "  Villa " })).toBe("/assets/placeholder/Villa.webp");
  });

  it("resolves project types through the same map", () => {
    expect(getPlaceholderImage({ projectType: "villa" })).toBe("/assets/placeholder/Villa.webp");
    expect(getPlaceholderImage({ projectType: "plot" })).toBe("/assets/placeholder/Plot.webp");
  });

  it.each([["other"], [""], ["  "], [undefined], [null], ["spaceship"]])(
    "falls back to the generic placeholder for %s",
    (type) => {
      expect(getPlaceholderImage({ propertyType: type })).toBe("/assets/placeholder/Apartment.webp");
    }
  );

  it("falls back when called with no options", () => {
    expect(getPlaceholderImage()).toBe("/assets/placeholder/Apartment.webp");
  });

  it("lists every known placeholder exactly once", () => {
    const all = getAllPlaceholderImages();
    expect(all).toHaveLength(8);
    expect(new Set(all).size).toBe(8);
    expect(all).toContain("/assets/placeholder/Coworking.webp");
  });
});
