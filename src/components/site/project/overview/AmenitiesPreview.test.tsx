import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AmenitiesPreview } from "./AmenitiesPreview";
import type { ProjectDetail } from "@/lib/api/projects";

function project(amenities: { name: string; category: string | null }[]): ProjectDetail {
  return {
    id: 1,
    name: "Casa Grand",
    canonicalSlug: "casa-grand-pp0007",
    projectAmenities: amenities.map((a, i) => ({
      amenityId: i + 1,
      amenity: { id: i + 1, name: a.name, category: a.category },
    })),
  } as unknown as ProjectDetail;
}

const many = Array.from({ length: 11 }, (_, i) => ({
  name: `Amenity ${i + 1}`,
  category: i % 2 === 0 ? "security" : "lifestyle",
}));

afterEach(cleanup);

describe("AmenitiesPreview", () => {
  it("shows seven tiles and a +N tile when there are more than eight", () => {
    render(<AmenitiesPreview project={project(many)} />);
    expect(screen.getByText("Amenity 7")).toBeInTheDocument();
    expect(screen.queryByText("Amenity 8")).not.toBeInTheDocument();
    const more = screen.getByText("+4").closest("a");
    expect(more).toHaveAttribute("href", "/casa-grand-pp0007/amenities");
    expect(screen.getByText("View all 11")).toBeInTheDocument();
  });

  it("links each category chip to its group on the amenities page", () => {
    render(<AmenitiesPreview project={project(many)} />);
    expect(screen.getByText("11 amenities in 2 categories")).toBeInTheDocument();
    expect(screen.getByText("Security").closest("a")).toHaveAttribute(
      "href",
      "/casa-grand-pp0007/amenities#amenities-security",
    );
  });

  it("shows every tile and no +N tile at eight or fewer", () => {
    render(<AmenitiesPreview project={project(many.slice(0, 8))} />);
    expect(screen.getByText("Amenity 8")).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("offers to request the list when there are none", () => {
    render(<AmenitiesPreview project={project([])} />);
    expect(screen.getByText("Request amenity list")).toBeInTheDocument();
  });
});
