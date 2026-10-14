import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectDetail } from "@/lib/api/projects";
import { projectFinanceEstimate } from "@/lib/project-finance";
import { CalculatorsSection } from "./CalculatorsSection";

afterEach(cleanup);
const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const unit = (id: number, bedrooms: number, area: number, price: number, status = "available") => ({
  id, unitCode: `U${id}`, title: "", unitType: `${bedrooms}bhk`, bedrooms, price: String(price),
  listingMode: "sale", status, superBuiltupAreaSqft: String(area),
});
const units = [unit(1, 2, 1200, 5000000), unit(2, 2, 1400, 6000000), unit(3, 3, 1600, 8000000), unit(4, 4, 2200, 10000000, "booked")];
const project = (rows: unknown[] = units, id = 1) => ({ id, projectType: "apartment", units: rows } as ProjectDetail);
const currentEmi = () => screen.getByRole("status", { name: "Estimated monthly EMI" });

describe("project finance unit picker", () => {
  it("shows visible BHK choices with starting EMIs and area configurations", () => {
    render(<CalculatorsSection project={project()} />);
    const twoBhk = screen.getByRole("button", { name: /^2 BHK/ });
    expect(twoBhk).toHaveAttribute("aria-pressed", "true");
    expect(twoBhk).toHaveTextContent(`From ${money(projectFinanceEstimate(project())!.monthlyEmi)}/mo`);
    expect(screen.getByRole("button", { name: /^3 BHK/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^4 BHK/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /1,200 sq.ft/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /1,400 sq.ft/ })).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Full EMI calculator" })).toHaveAttribute("href", "/emi-calculator");
    expect(screen.getByRole("link", { name: "Check affordability" })).toHaveAttribute("href", "/affordability-calculator");
  });

  it("calculates the selected area configuration and the starting EMI of another BHK", () => {
    render(<CalculatorsSection project={project()} />);
    fireEvent.click(screen.getByRole("radio", { name: /1,400 sq.ft/ }));
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(project(), { unitId: 2 })!.monthlyEmi));
    expect(screen.getByRole("radio", { name: /1,400 sq.ft/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /^3 BHK/ }));
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(project(), { unitId: 3 })!.monthlyEmi));
    expect(screen.getByRole("button", { name: /^3 BHK/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("radio", { name: /1,600 sq.ft/ })).toBeChecked();
    expect(screen.queryByRole("radio", { name: /1,400 sq.ft/ })).not.toBeInTheDocument();
  });

  it("updates EMI, type starting estimates and the visual repayment split with both sliders", () => {
    render(<CalculatorsSection project={project()} />);
    const originalBar = screen.getByRole("img").getAttribute("aria-label");
    fireEvent.change(screen.getByLabelText("Interest rate"), { target: { value: "10" } });
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(project(), { annualRatePct: 10 })!.monthlyEmi));
    expect(screen.getByRole("button", { name: /^3 BHK/ })).toHaveTextContent(money(projectFinanceEstimate(project(), { unitId: 3, annualRatePct: 10 })!.monthlyEmi));
    expect(screen.getByRole("img").getAttribute("aria-label")).not.toBe(originalBar);
    fireEvent.change(screen.getByLabelText("Loan tenure"), { target: { value: "10" } });
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(project(), { annualRatePct: 10, years: 10 })!.monthlyEmi));
  });

  it("keeps duplicate area configurations individually selectable", () => {
    const first = { ...unit(1, 2, 1200, 5000000), title: "Garden view" };
    const second = { ...unit(2, 2, 1200, 6000000), title: "Street view" };
    render(<CalculatorsSection project={project([first, second])} />);
    fireEvent.click(screen.getByRole("radio", { name: /Street view/ }));
    expect(screen.getByRole("radio", { name: /Street view/ })).toBeChecked();
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(project([first, second]), { unitId: 2 })!.monthlyEmi));
  });

  it("resets to the new project's available units on project navigation", () => {
    const view = render(<CalculatorsSection project={project()} />);
    fireEvent.click(screen.getByRole("button", { name: /^3 BHK/ }));
    fireEvent.change(screen.getByLabelText("Interest rate"), { target: { value: "10" } });
    const next = project([unit(8, 4, 2200, 15000000)], 2);
    view.rerender(<CalculatorsSection project={next} />);
    expect(screen.getByRole("button", { name: /^4 BHK/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Interest rate")).toHaveValue("7.25");
    expect(currentEmi()).toHaveTextContent(money(projectFinanceEstimate(next)!.monthlyEmi));
  });

  it("does not invent prices or show selectors for unpriced projects", () => {
    render(<CalculatorsSection project={project([{ ...units[0], price: null }])} />);
    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Estimated monthly EMI" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Full EMI calculator" })).toBeInTheDocument();
  });
});
