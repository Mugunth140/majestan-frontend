// site/majestan-frontend/src/components/site/property/sections/LocalitySection.test.tsx
import { describe, expect, it } from "vitest";
import {
  GraduationCap,
  ShoppingBag,
  Bus,
  Landmark,
  MapPin,
  Stethoscope,
  Film,
} from "lucide-react";
import { resolveLocalityIcon } from "./LocalitySection";

describe("resolveLocalityIcon", () => {
  it("matches the kebab-case names stored with the data", () => {
    expect(resolveLocalityIcon("graduation-cap")).toBe(GraduationCap);
    expect(resolveLocalityIcon("stethoscope")).toBe(Stethoscope);
    expect(resolveLocalityIcon("shopping-bag")).toBe(ShoppingBag);
    expect(resolveLocalityIcon("bus")).toBe(Bus);
    expect(resolveLocalityIcon("film")).toBe(Film);
    expect(resolveLocalityIcon("landmark")).toBe(Landmark);
  });

  it("still matches legacy PascalCase names and ignores case", () => {
    expect(resolveLocalityIcon("GraduationCap")).toBe(GraduationCap);
    expect(resolveLocalityIcon("SHOPPING-BAG")).toBe(ShoppingBag);
  });

  it("falls back to a pin for unknown or missing names", () => {
    expect(resolveLocalityIcon("roller-rink")).toBe(MapPin);
    expect(resolveLocalityIcon("")).toBe(MapPin);
    expect(resolveLocalityIcon(undefined)).toBe(MapPin);
  });
});
