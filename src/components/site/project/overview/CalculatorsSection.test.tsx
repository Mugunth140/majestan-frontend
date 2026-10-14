import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectDetail } from "@/lib/api/projects";
import { CalculatorsSection } from "./CalculatorsSection";

afterEach(cleanup);

const project = (units: unknown[]) => ({
  projectType: "apartment",
  units,
} as ProjectDetail);

const pricedUnit = {
  id: 1,
  title: "",
  unitType: "apartment_unit",
  bedrooms: 2,
  price: "5000000",
  listingMode: "sale",
  status: "available",
  superBuiltupAreaSqft: "1200",
};

describe("CalculatorsSection", () => {
  it("shows a concise estimate and links to both customization calculators", () => {
    const { container } = render(<CalculatorsSection project={project([pricedUnit])} />);

    expect(screen.getByText("Estimated monthly EMI")).toBeInTheDocument();
    expect(screen.getByText("Indicative monthly income")).toBeInTheDocument();
    expect(screen.getByText(/From ₹50 L · 2 BHK · 1,200 sq\.ft/)).toBeInTheDocument();
    expect(screen.getByText(/20% down/)).toBeInTheDocument();
    expect(screen.getByText(/₹10 L down payment · ₹40 L loan/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customize with EMI calculator" })).toHaveAttribute("href", "/emi-calculator");
    expect(screen.getByRole("link", { name: "Customize with affordability calculator" })).toHaveAttribute("href", "/affordability-calculator");
    expect(container.querySelector("input, [role=tab], input[type=range]")).toBeNull();
  });

  it("does not invent a price or display estimates when no available unit is priced", () => {
    render(<CalculatorsSection project={project([{ ...pricedUnit, price: null }])} />);

    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByText("Estimated monthly EMI")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customize with EMI calculator" })).toBeInTheDocument();
  });
});
