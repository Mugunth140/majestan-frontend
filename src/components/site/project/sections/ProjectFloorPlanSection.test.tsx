import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectFloorPlanSection } from "./ProjectFloorPlanSection";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";

function unit(overrides: Partial<ProjectUnit> = {}): ProjectUnit {
  return {
    id: 1,
    unitCode: "A-101",
    title: null,
    unitType: "apartment_unit",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqft: null,
    builtupAreaSqft: null,
    superBuiltupAreaSqft: "1292",
    furnishedStatus: null,
    facing: null,
    price: "9690000",
    status: "available",
    floorPlanImageUrl: null,
    isPrimary: true,
    ...overrides,
  };
}

function project(units: ProjectUnit[]): ProjectDetail {
  return {
    id: 1,
    name: "Ezhaya Ektha",
    canonicalSlug: "ezhaya-ektha-pa0006",
    projectType: "apartment",
    units,
  } as unknown as ProjectDetail;
}

const twoBhk = [
  unit({ id: 1, unitCode: "A-101", floorPlanImageUrl: "https://cdn.test/2bhk-a.png" }),
  unit({ id: 2, unitCode: "A-102", floorPlanImageUrl: "https://cdn.test/2bhk-a.png" }),
  unit({ id: 3, unitCode: "B-201", floorPlanImageUrl: "https://cdn.test/2bhk-b.png", status: "sold" }),
];
const threeBhk = [unit({ id: 4, unitCode: "C-301", bedrooms: 3, superBuiltupAreaSqft: "1444" })];

afterEach(cleanup);

describe("ProjectFloorPlanSection", () => {
  it("opens with jump cards to a section per configuration", () => {
    render(<ProjectFloorPlanSection project={project([...twoBhk, ...threeBhk])} />);
    const jumps = within(document.getElementById("configurations")!).getAllByRole("link");
    expect(jumps.map((a) => a.getAttribute("href"))).toEqual(["#bhk-2", "#bhk-3"]);
    expect(document.getElementById("bhk-2")).not.toBeNull();
    expect(document.getElementById("bhk-3")).not.toBeNull();
  });

  it("heads each unit with its name, then its plan, then its categories, all closed", () => {
    render(<ProjectFloorPlanSection project={project(twoBhk)} />);
    const [first] = within(document.getElementById("bhk-2")!).getAllByRole("article");
    expect(within(first).getByRole("heading", { level: 3 })).toHaveTextContent("A-101");
    const plan = within(first).getByRole("button", { name: /A-101 floor plan, 2 BHK/ });
    expect(plan).toHaveAttribute("aria-haspopup", "dialog");
    const categories = [...first.querySelectorAll("details")];
    expect(categories[0].querySelector("summary")).toHaveTextContent("Price & area");
    expect(categories[0].querySelector("summary")).toHaveTextContent("₹96.9 L · 1,292 sq.ft");
    expect(within(first).queryByRole("tab")).toBeNull();
    categories.forEach((details) => expect(details).not.toHaveAttribute("open"));
  });

  it("keeps each unit flat: no card inside the configuration card", () => {
    render(<ProjectFloorPlanSection project={project(twoBhk)} />);
    const section = document.getElementById("bhk-2")!;
    expect(section.querySelectorAll("article")).toHaveLength(3);
    expect(section.querySelectorAll("article article")).toHaveLength(0);
  });

  it("uses the unit's CRM title as its name when it has one", () => {
    render(
      <ProjectFloorPlanSection
        project={project([unit({ title: "East Facing 2BHK", unitCode: "U1" })])}
      />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("East Facing 2BHK");
    expect(screen.getByText(/^U1 · 2 BHK/)).toBeInTheDocument();
  });

  it("offers the plan on request when a unit has none", () => {
    render(<ProjectFloorPlanSection project={project(threeBhk)} />);
    expect(screen.getByText("Request floor plan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /floor plan,/ })).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no units", () => {
    render(<ProjectFloorPlanSection project={project([])} />);
    expect(screen.getByText("Configurations are being finalised")).toBeInTheDocument();
  });
});
