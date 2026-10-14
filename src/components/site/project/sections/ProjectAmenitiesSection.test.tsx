import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectAmenitiesSection } from "./ProjectAmenitiesSection";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";

type Item = { id: number; name: string; icon?: string };

const sofa: Item = { id: 1, name: "Sofa", icon: "Sofa" };
const wardrobe: Item = { id: 2, name: "Wardrobe", icon: "Archive" };
const ac: Item = { id: 3, name: "Air Conditioner" };

function unit(bedrooms: number, items: Item[], furnishedStatus: string | null = null): ProjectUnit {
  return {
    id: bedrooms * 10 + items.length,
    unitCode: `U${bedrooms}`,
    title: null,
    unitType: `${bedrooms}bhk`,
    bedrooms,
    furnishedStatus,
    furnishingItems: items,
    status: "available",
    price: null,
  } as unknown as ProjectUnit;
}

function project({
  projectType = "apartment",
  amenities = [],
  units = [],
}: {
  projectType?: string;
  amenities?: { name: string; category: string | null }[];
  units?: ProjectUnit[];
}): ProjectDetail {
  return {
    id: 1,
    name: "Emerald Heights",
    canonicalSlug: "emerald-heights-pa0006",
    projectType,
    units,
    projectAmenities: amenities.map((a, i) => ({
      amenityId: i + 1,
      amenity: { id: i + 1, name: a.name, category: a.category },
    })),
  } as unknown as ProjectDetail;
}

const amenities = [
  { name: "CCTV", category: "security" },
  { name: "Lift", category: "feature" },
  { name: "Power Backup", category: "utility" },
  { name: "Generator", category: "utilities" },
];

afterEach(cleanup);

describe("ProjectAmenitiesSection", () => {
  it("jumps to the amenities and furnishing cards with their counts", () => {
    render(
      <ProjectAmenitiesSection
        project={project({ amenities, units: [unit(2, [sofa, wardrobe], "semi_furnished")] })}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const [toAmenities, toFurnishing] = within(nav).getAllByRole("link");
    expect(toAmenities).toHaveAttribute("href", "#amenities");
    expect(toAmenities).toHaveTextContent("4 amenities");
    expect(toAmenities).toHaveTextContent("Across 3 categories");
    expect(toFurnishing).toHaveAttribute("href", "#furnishing");
    expect(toFurnishing).toHaveTextContent("2 furnishing items");
    expect(toFurnishing).toHaveTextContent("Semi Furnished");
    expect(document.getElementById("amenities")).not.toBeNull();
    expect(document.getElementById("furnishing")).not.toBeNull();
  });

  it("merges the CRM's singular and plural categories into one group", () => {
    render(<ProjectAmenitiesSection project={project({ amenities })} />);
    const chips = within(screen.getByRole("group", { name: "Amenity categories" })).getAllByRole("button");
    expect(chips.map((chip) => chip.textContent)).toEqual(["All4", "Features1", "Security1", "Utilities2"]);
    const utilities = document.getElementById("amenities-utilities")!;
    expect(within(utilities).getByText("Power Backup")).toBeInTheDocument();
    expect(within(utilities).getByText("Generator")).toBeInTheDocument();
  });

  it("names the configurations each item comes with, and compares them on demand", () => {
    render(
      <ProjectAmenitiesSection
        project={project({
          units: [unit(2, [sofa], "semi_furnished"), unit(3, [sofa, wardrobe, ac], "fully_furnished")],
        })}
      />,
    );
    const card = document.getElementById("furnishing")!;
    expect(within(card).getAllByText("3 BHK").length).toBeGreaterThan(0);
    expect(within(card).getByText("Fully Furnished")).toBeInTheDocument();
    expect(within(card).getByText(/Furnishing differs between units/)).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "2 BHK" }));
    expect(within(card).getAllByText("Not in 2 BHK")).toHaveLength(2);
  });

  it("filters amenities by category and by search", () => {
    render(<ProjectAmenitiesSection project={project({ amenities })} />);
    fireEvent.click(screen.getByRole("button", { name: /^Security/ }));
    expect(screen.getByText("CCTV")).toBeInTheDocument();
    expect(screen.queryByText("Lift")).not.toBeInTheDocument();
  });

  it("shows one status and no configuration notes when every unit matches", () => {
    render(
      <ProjectAmenitiesSection
        project={project({
          units: [unit(2, [sofa, wardrobe], "semi_furnished"), unit(3, [sofa, wardrobe], "semi_furnished")],
        })}
      />,
    );
    const card = document.getElementById("furnishing")!;
    expect(within(card).getByText("All configurations")).toBeInTheDocument();
    expect(within(card).getByText("Semi Furnished")).toBeInTheDocument();
    expect(within(card).queryByText("2 BHK")).not.toBeInTheDocument();
    expect(within(card).queryByText(/differs between units/)).not.toBeInTheDocument();
  });

  it("asks about furnishing when none is listed, but not for an unfurnished handover", () => {
    render(<ProjectAmenitiesSection project={project({ units: [unit(2, [])] })} />);
    expect(screen.getByText("Ask about furnishing")).toBeInTheDocument();
    cleanup();

    render(<ProjectAmenitiesSection project={project({ units: [unit(2, [], "unfurnished")] })} />);
    expect(screen.getByText("Unfurnished", { selector: "dd" })).toBeInTheDocument();
    expect(screen.queryByText("Ask about furnishing")).not.toBeInTheDocument();
  });

  it("leaves furnishing off plot projects", () => {
    render(<ProjectAmenitiesSection project={project({ projectType: "plot", amenities })} />);
    expect(document.getElementById("amenities")).not.toBeNull();
    expect(document.getElementById("furnishing")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "On this page" })).not.toBeInTheDocument();
  });
});
