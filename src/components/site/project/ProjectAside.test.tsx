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

it('keeps the project sidebar but replaces enquiries with Sold Out', () => {
  render(<ProjectAside project={{...mockProject, status: 'booked'}} />);
  expect(screen.getByRole('status')).toHaveTextContent('Sold Out');
  expect(screen.getByText('Green Acres')).toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /enquire now/i})).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /schedule visit/i})).not.toBeInTheDocument();
});
