// site/majestan-frontend/src/components/site/property/FloorPlanTeaser.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { FloorPlanTeaser } from "./FloorPlanTeaser";

afterEach(cleanup);

const details = {
  bedrooms: 3,
  bathrooms: 3,
  areaSqft: "1456.00",
  parking: 0,
  furnished: true,
};

describe("FloorPlanTeaser", () => {
  it("shows the key measurements and links to the floor-plan page", () => {
    const { container } = render(
      <FloorPlanTeaser details={details} floorPlanHref="/some-villa/floor-plan" />,
    );

    expect(screen.getByText("1,456 sq.ft")).toBeDefined();
    expect(screen.getByText("3 BHK")).toBeDefined();
    expect(screen.getByText("3 Bath")).toBeDefined();
    const link = screen.getByRole("link", { name: "View All" });
    expect(link.getAttribute("href")).toBe("/some-villa/floor-plan");
    // The teaser must never show uploaded plan imagery — only measurements.
    expect(container.querySelector("img")).toBeNull();
  });

  it("previews two named plans and links to the full floor-plan page for the rest", () => {
    render(
      <FloorPlanTeaser
        details={details}
        floorPlanHref="/some-villa/floor-plan"
        plans={[
          { key: "ground", title: "Ground floor", src: "/ground.png", isPdf: false },
          { key: "first", title: "First floor", src: "/first.png", isPdf: false },
          { key: "second", title: "Second floor", src: "/second.png", isPdf: false },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "View Ground floor" })).toBeDefined();
    expect(screen.getByRole("button", { name: "View First floor" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "View Second floor" })).toBeNull();
    const link = screen.getByRole("link", { name: "View more" });
    expect(link.getAttribute("href")).toBe("/some-villa/floor-plan");
  });

  it("falls back to dashes when measurements are missing", () => {
    render(<FloorPlanTeaser details={null} floorPlanHref="/x/floor-plan" />);

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
