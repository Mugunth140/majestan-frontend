import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectDetail } from "@/lib/api/projects";
import { CalculatorsSection } from "./CalculatorsSection";

afterEach(cleanup);

const project = (units: unknown[], id = 1) => ({ id, projectType: "apartment", units } as ProjectDetail);

const pricedUnit = {
  id: 1, title: "", unitType: "apartment_unit", bedrooms: 2, price: "5000000",
  listingMode: "sale", status: "available", superBuiltupAreaSqft: "1200",
};

describe("CalculatorsSection", () => {
  it("shows a compact estimate, selector, sliders, visual breakdown, and calculator links", () => {
    render(<CalculatorsSection project={project([pricedUnit])} />);

    expect(screen.getByLabelText("Choose a home")).toBeInTheDocument();
    expect(screen.getByText("Monthly EMI")).toBeInTheDocument();
    expect(screen.getByLabelText("Interest rate")).toHaveAttribute("type", "range");
    expect(screen.getByLabelText("Loan tenure")).toHaveAttribute("type", "range");
    expect(screen.getByText("₹10 L down payment")).toBeInTheDocument();
    expect(screen.getByText("Loan principal")).toBeInTheDocument();
    expect(screen.getByText("Total interest")).toBeInTheDocument();
    expect(screen.getByText("Indicative monthly income")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open EMI calculator" })).toHaveAttribute("href", "/emi-calculator");
    expect(screen.getByRole("link", { name: "Open affordability calculator" })).toHaveAttribute("href", "/affordability-calculator");
  });

  it("updates the estimate when selecting another available home or changing either slider", () => {
    const largerUnit = { ...pricedUnit, id: 2, bedrooms: 3, price: "8000000", superBuiltupAreaSqft: "1600" };
    render(<CalculatorsSection project={project([pricedUnit, largerUnit])} />);

    const emi = () => screen.getByText("Monthly EMI").parentElement?.querySelector("strong")?.textContent;
    const breakdown = () => screen.getByRole("img").getAttribute("aria-label");
    const originalEmi = emi();
    const originalBreakdown = breakdown();
    fireEvent.change(screen.getByLabelText("Choose a home"), { target: { value: "2" } });
    const largerHomeEmi = emi();
    expect(largerHomeEmi).not.toBe(originalEmi);
    const largerHomeBreakdown = breakdown();
    expect(largerHomeBreakdown).not.toBe(originalBreakdown);
    expect(screen.getByText("₹16 L down payment")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Interest rate"), { target: { value: "10" } });
    const higherRateEmi = emi();
    expect(higherRateEmi).not.toBe(largerHomeEmi);
    const higherRateBreakdown = breakdown();
    expect(higherRateBreakdown).not.toBe(largerHomeBreakdown);
    fireEvent.change(screen.getByLabelText("Loan tenure"), { target: { value: "10" } });
    expect(emi()).not.toBe(higherRateEmi);
    expect(breakdown()).not.toBe(higherRateBreakdown);
  });

  it("does not invent a price or display estimates when no available unit is priced", () => {
    render(<CalculatorsSection project={project([{ ...pricedUnit, price: null }])} />);

    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByText("Monthly EMI")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Choose a home")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open EMI calculator" })).toBeInTheDocument();
  });
});
