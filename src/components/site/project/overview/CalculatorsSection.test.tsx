import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CalculatorsSection } from "./CalculatorsSection";

afterEach(cleanup);

describe("CalculatorsSection", () => {
  it("keeps both calculators mounted and preserves slider values when switching tabs", () => {
    const { container } = render(<CalculatorsSection />);

    const emiTab = screen.getByRole("tab", { name: "Monthly EMI" });
    expect(emiTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Monthly EMI" })).toBeVisible();

    const amount = container.querySelector<HTMLInputElement>(
      '#emi-calculator-panel input[aria-label="Loan amount"]',
    );
    expect(amount).not.toBeNull();
    fireEvent.change(amount!, { target: { value: "6200000" } });
    expect(amount).toHaveValue("6200000");

    fireEvent.click(screen.getByRole("tab", { name: "Home budget" }));
    expect(screen.getByRole("tabpanel", { name: "Home budget" })).toBeVisible();
    expect(container.querySelector("#emi-calculator-panel")).not.toBeVisible();
    expect(container.querySelector("#affordability-calculator-panel input[aria-label='Gross monthly income']")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Open the full affordability calculator" })).toHaveAttribute(
      "href",
      "/affordability-calculator",
    );

    fireEvent.click(emiTab);
    expect(amount).toHaveValue("6200000");
    expect(screen.getByRole("link", { name: "Open the full EMI calculator" })).toHaveAttribute(
      "href",
      "/emi-calculator",
    );
  });

  it("supports arrow key navigation between calculator tabs", () => {
    render(<CalculatorsSection />);
    const emiTab = screen.getByRole("tab", { name: "Monthly EMI" });
    emiTab.focus();
    fireEvent.keyDown(emiTab, { key: "ArrowRight" });

    const budgetTab = screen.getByRole("tab", { name: "Home budget" });
    expect(budgetTab).toHaveFocus();
    expect(budgetTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Home budget" })).toBeVisible();
  });
});
