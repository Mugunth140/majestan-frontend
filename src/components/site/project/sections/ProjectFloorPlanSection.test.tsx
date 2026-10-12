import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  } as ProjectUnit;
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

function configTabs() {
  return within(screen.getByRole("tablist", { name: "Configurations" })).getAllByRole("tab");
}

function unitTabs() {
  return within(screen.getByRole("tablist", { name: "Units" })).getAllByRole("tab");
}

describe("ProjectFloorPlanSection", () => {
  it("selects the first configuration and its first unit by default", () => {
    render(<ProjectFloorPlanSection project={project([...twoBhk, ...threeBhk])} />);
    const tabs = configTabs();
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    // Only the active unit is exposed; the rest render hidden.
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("A-101");
  });

  it("switching configuration resets to that group's first unit", () => {
    render(<ProjectFloorPlanSection project={project([...twoBhk, ...threeBhk])} />);
    fireEvent.click(configTabs()[1]);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("C-301");
    expect(configTabs()[1]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(configTabs()[0]);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("A-101");
  });

  it("switches units via the area strip and disambiguates duplicate areas", () => {
    render(<ProjectFloorPlanSection project={project(twoBhk)} />);
    const tabs = unitTabs();
    expect(tabs.map((t) => t.textContent)).toEqual([
      "1292 SQ.FT",
      "1292 SQ.FT · A-102",
      "1292 SQ.FT · B-201",
    ]);
    fireEvent.click(tabs[1]);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("A-102");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("hides the unit strip for single-unit configurations", () => {
    render(<ProjectFloorPlanSection project={project(threeBhk)} />);
    expect(screen.queryByRole("tablist", { name: "Units" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("C-301");
  });

  it("heads the unit with its name, plan and closed categories", () => {
    render(<ProjectFloorPlanSection project={project(twoBhk)} />);
    const article = screen.getByRole("heading", { level: 3 }).closest("article")!;
    expect(within(article).getByRole("heading", { level: 3 })).toHaveTextContent("A-101");
    const plan = within(article).getByRole("button", { name: /A-101 floor plan, 2 BHK/ });
    expect(plan).toHaveAttribute("aria-haspopup", "dialog");
    const categories = [...article.querySelectorAll("details")];
    expect(categories[0].querySelector("summary")).toHaveTextContent("Price & area");
    expect(categories[0].querySelector("summary")).toHaveTextContent("₹96.9 L · 1,292 sq.ft");
    categories.forEach((details) => expect(details).not.toHaveAttribute("open"));
  });

  it("shows the facts row only for data the unit and project have", () => {
    render(<ProjectFloorPlanSection project={project(twoBhk)} />);
    const article = screen.getByRole("heading", { level: 3 }).closest("article")!;
    expect(within(article).getByText("Saleable Area")).toBeInTheDocument();
    // Header area line, Super built-up spec row, and the facts cell.
    expect(within(article).getAllByText("1,292 sq.ft")).toHaveLength(3);
    expect(within(article).queryByText("Rera ID")).not.toBeInTheDocument();
    expect(within(article).queryByText("Possession Status")).not.toBeInTheDocument();
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
