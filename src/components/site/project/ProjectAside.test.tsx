import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectAside } from "./ProjectAside";
import type { ProjectDetail } from "@/lib/api/projects";

const mockProject = {
  id: 1,
  name: "Green Acres",
  canonicalSlug: "green-acres-pp001",
  projectType: "apartment",
  units: [],
  ranges: {
    minPrice: 5000000,
    maxPrice: 8500000,
    bhk: [2, 3],
  },
} as unknown as ProjectDetail;

afterEach(cleanup);

describe("ProjectAside", () => {
  it("renders the Listed By card with brand identity and verified badge", () => {
    render(<ProjectAside project={mockProject} />);

    expect(screen.getByText("Listed by")).toBeInTheDocument();
    expect(screen.getByText("Majestan Realty")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    const logo = screen.getByAltText("Majestan Realty");
    expect(logo).toBeInTheDocument();
  });
});
