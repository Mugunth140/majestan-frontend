import { describe, expect, it } from "vitest";
import {
  Briefcase,
  Car,
  Coffee,
  ConciergeBell,
  CookingPot,
  Forklift,
  Monitor,
  Presentation,
  Snowflake,
  TreePine,
  Wifi,
  Bath,
} from "lucide-react";
import { getIconForAmenity } from "./AmenitiesSection";

describe("getIconForAmenity workspace keywords", () => {
  it.each([
    ["High-Speed Wifi", Wifi],
    ["Office Pantry", CookingPot],
    ["Conference Hall", Presentation],
    ["Meeting Room", Presentation],
    ["Restroom", Bath],
    ["Workstation", Monitor],
    ["Private Cabin", Briefcase],
    ["Loading Dock", Forklift],
    ["Crane Facility", Forklift],
    ["Central AC", Snowflake],
    ["Cafeteria", Coffee],
    ["Reception", ConciergeBell],
  ])("maps %s to its workspace icon", (name, icon) => {
    expect(getIconForAmenity(name)).toBe(icon);
  });

  it("maps vehicle parking to a car, not a tree", () => {
    expect(getIconForAmenity("Covered Car Parking")).toBe(Car);
  });

  it("keeps park and garden on the tree icon", () => {
    expect(getIconForAmenity("Central Park")).toBe(TreePine);
    expect(getIconForAmenity("Terrace Garden")).toBe(TreePine);
  });
});
